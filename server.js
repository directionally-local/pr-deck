#!/usr/bin/env node
/**
 * PR Deck - every open pull request in a GitHub org or user account, on one screen.
 *
 * Zero dependencies. Reuses the token from your existing gh CLI login
 * (or GITHUB_TOKEN / GH_TOKEN if set).
 */
import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const API = 'https://api.github.com';
const PORT = Number(process.env.PORT || 4317);
const HOST = process.env.HOST || '127.0.0.1';

const CACHE_TTL_MS = 20_000;
const REPOS_PER_QUERY = 8;
const MAX_REPOS = 400;
const PRS_PER_REPO = 50;
const CHECKS_PER_PR = 50;

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra || null;
  }
}

/* ------------------------------------------------------------------ auth */

let tokenState = { token: null, source: null };

async function resolveToken(force) {
  if (!force && tokenState.token) return tokenState;
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (envToken && envToken.trim()) {
    tokenState = { token: envToken.trim(), source: 'env' };
    return tokenState;
  }
  try {
    const { stdout } = await execFileAsync('gh', ['auth', 'token'], { timeout: 20000 });
    const token = stdout.trim();
    if (!token) throw new Error('empty token');
    tokenState = { token, source: 'gh' };
    return tokenState;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw new HttpError(500, 'The GitHub CLI (gh) is not installed or not on your PATH. Install it from https://cli.github.com and run "gh auth login".');
    }
    throw new HttpError(500, 'No GitHub token available. Run "gh auth login" in your terminal, or start PR Deck with GITHUB_TOKEN set.');
  }
}

async function apiFetch(pathname, options) {
  const opts = options || {};
  const { token } = await resolveToken();
  const headers = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'pr-deck',
  };
  if (opts.body) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + pathname, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (res.status === 401 && opts.retry !== false) {
    tokenState = { token: null, source: null };
    return apiFetch(pathname, { ...opts, retry: false });
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function graphql(query) {
  const res = await apiFetch('/graphql', { method: 'POST', body: { query } });
  if (!res.ok) {
    const msg = (res.data && res.data.message) || 'GitHub GraphQL request failed (' + res.status + ')';
    throw new HttpError(res.status, msg);
  }
  const payload = res.data || {};
  if (!payload.data) {
    const first = payload.errors && payload.errors[0];
    throw new HttpError(502, first ? first.message : 'GitHub returned no data');
  }
  return payload;
}

function apiMessage(res, fallback) {
  if (res && res.data && typeof res.data === 'object' && res.data.message) return res.data.message;
  return fallback;
}

/* ------------------------------------------------------------- discovery */

async function detectOwnerType(owner) {
  const res = await apiFetch('/orgs/' + encodeURIComponent(owner));
  if (res.ok) return 'org';
  if (res.status === 404) return 'user';
  if (res.status === 401) throw new HttpError(401, 'GitHub rejected the token. Run "gh auth login" again.');
  throw new HttpError(res.status, apiMessage(res, 'Could not look up "' + owner + '" on GitHub.'));
}

async function listRepos(owner, type) {
  const repos = [];
  const base = type === 'org'
    ? '/orgs/' + encodeURIComponent(owner) + '/repos'
    : '/users/' + encodeURIComponent(owner) + '/repos';
  for (let page = 1; page <= 10; page++) {
    const res = await apiFetch(base + '?per_page=100&page=' + page + '&sort=pushed&direction=desc&type=all');
    if (!res.ok) {
      if (res.status === 404) {
        throw new HttpError(404, 'No GitHub organization or user named "' + owner + '" was found.');
      }
      throw new HttpError(res.status, apiMessage(res, 'Could not list repositories for ' + owner + '.'));
    }
    const batch = Array.isArray(res.data) ? res.data : [];
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

/* --------------------------------------------------------------- graphql */

const PR_FIELDS = [
  'number', 'title', 'url', 'isDraft', 'createdAt', 'updatedAt',
  'mergeable', 'mergeStateStatus', 'reviewDecision',
  'baseRefName', 'headRefName', 'isCrossRepository',
  'additions', 'deletions', 'changedFiles',
  'comments { totalCount }',
  'author { login avatarUrl url }',
  'commits(last: 1) { nodes { commit { oid statusCheckRollup { state contexts(first: ' + CHECKS_PER_PR + ') { nodes {',
  '__typename',
  '... on CheckRun { name status conclusion detailsUrl startedAt completedAt checkSuite { workflowRun { workflow { name } } } }',
  '... on StatusContext { context state targetUrl description }',
  '} } } } } }',
].join(' ');

function buildQuery(owner, repos) {
  const parts = repos.map((repo, i) => {
    return 'r' + i + ': repository(owner: ' + JSON.stringify(owner) + ', name: ' + JSON.stringify(repo.name) + ') {'
      + ' nameWithOwner url isPrivate isArchived'
      + ' pullRequests(states: OPEN, first: ' + PRS_PER_REPO + ', orderBy: {field: UPDATED_AT, direction: DESC}) {'
      + ' totalCount nodes { ' + PR_FIELDS + ' } } }';
  });
  return 'query { rateLimit { limit cost remaining resetAt } ' + parts.join(' ') + ' }';
}

/* ----------------------------------------------------------- normalizing */

function parseRunId(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = '/actions/runs/';
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const rest = url.slice(at + marker.length);
  const id = rest.split('/')[0];
  return id && id.length > 0 ? id : null;
}

function normalizeCheck(node) {
  if (!node) return null;
  if (node.__typename === 'CheckRun') {
    const status = String(node.status || '').toUpperCase();
    const conclusion = String(node.conclusion || '').toUpperCase();
    let state = 'pending';
    if (status === 'COMPLETED') {
      if (conclusion === 'SUCCESS') state = 'success';
      else if (conclusion === 'NEUTRAL' || conclusion === 'STALE') state = 'neutral';
      else if (conclusion === 'SKIPPED') state = 'skipped';
      else if (conclusion === 'CANCELLED') state = 'cancelled';
      // A run waiting for a maintainer's approval hasn't failed: GitHub marks the PR
      // UNSTABLE, but nothing ran. Keep it apart so it isn't reported as a failure.
      else if (conclusion === 'ACTION_REQUIRED') state = 'action_required';
      else if (!conclusion) state = 'pending';
      else state = 'failure';
    }
    const workflow = node.checkSuite && node.checkSuite.workflowRun && node.checkSuite.workflowRun.workflow
      ? node.checkSuite.workflowRun.workflow.name
      : null;
    return {
      kind: 'check',
      name: node.name || 'check',
      workflow,
      state,
      status,
      conclusion,
      url: node.detailsUrl || null,
      runId: parseRunId(node.detailsUrl),
      startedAt: node.startedAt || null,
      completedAt: node.completedAt || null,
      description: null,
    };
  }
  const raw = String(node.state || '').toUpperCase();
  let state = 'neutral';
  if (raw === 'SUCCESS') state = 'success';
  else if (raw === 'PENDING' || raw === 'EXPECTED') state = 'pending';
  else if (raw === 'FAILURE' || raw === 'ERROR') state = 'failure';
  return {
    kind: 'status',
    name: node.context || 'status',
    workflow: null,
    state,
    status: raw,
    conclusion: raw,
    url: node.targetUrl || null,
    runId: null,
    startedAt: null,
    completedAt: null,
    description: node.description || null,
  };
}

function summarizeChecks(items) {
  const counts = { total: items.length, success: 0, failure: 0, pending: 0, neutral: 0, skipped: 0, cancelled: 0, action_required: 0 };
  for (const item of items) {
    if (Object.prototype.hasOwnProperty.call(counts, item.state)) counts[item.state] += 1;
  }
  let state = 'none';
  if (counts.total === 0) state = 'none';
  else if (counts.failure > 0) state = 'failure';
  else if (counts.action_required > 0) state = 'action_required';
  else if (counts.pending > 0) state = 'pending';
  else if (counts.success > 0) state = 'success';
  else state = 'neutral';
  return { ...counts, state };
}

function deriveStatus(pr) {
  if (pr.isDraft) return { key: 'draft', label: 'Draft', tone: 'muted' };
  if (pr.mergeable === 'CONFLICTING' || pr.mergeStateStatus === 'DIRTY') {
    return { key: 'conflicts', label: 'Merge conflicts', tone: 'danger' };
  }
  if (pr.mergeStateStatus === 'BEHIND') return { key: 'behind', label: 'Behind base', tone: 'attention' };
  if (pr.mergeStateStatus === 'UNSTABLE' || pr.checks.state === 'failure') {
    // Nothing failed, but a run is waiting for a maintainer to approve it. GitHub still
    // calls the PR UNSTABLE, so say what is actually needed instead of "Checks failing".
    if (pr.checks.failure === 0 && pr.checks.action_required > 0) {
      return { key: 'approval', label: 'Needs approval', tone: 'attention' };
    }
    return { key: 'failing', label: 'Checks failing', tone: 'danger' };
  }
  if (pr.mergeStateStatus === 'BLOCKED') {
    if (pr.checks.pending > 0) return { key: 'blocked', label: 'Blocked · CI running', tone: 'attention' };
    if (pr.reviewDecision === 'CHANGES_REQUESTED') return { key: 'blocked', label: 'Changes requested', tone: 'danger' };
    if (pr.reviewDecision === 'REVIEW_REQUIRED') return { key: 'blocked', label: 'Review required', tone: 'attention' };
    return { key: 'blocked', label: 'Blocked', tone: 'attention' };
  }
  if (pr.mergeStateStatus === 'CLEAN' || pr.mergeStateStatus === 'HAS_HOOKS') {
    return { key: 'ready', label: 'Ready to merge', tone: 'success' };
  }
  if (pr.mergeable === 'UNKNOWN' || pr.mergeStateStatus === 'UNKNOWN' || !pr.mergeStateStatus) {
    return { key: 'checking', label: 'Checking mergeability', tone: 'muted' };
  }
  return { key: 'blocked', label: String(pr.mergeStateStatus).toLowerCase(), tone: 'attention' };
}

function normalizePr(node, repo) {
  const commitNode = node.commits && node.commits.nodes && node.commits.nodes[0];
  const commit = commitNode ? commitNode.commit : null;
  const rollup = commit ? commit.statusCheckRollup : null;
  const rawContexts = rollup && rollup.contexts && rollup.contexts.nodes ? rollup.contexts.nodes : [];
  const checks = rawContexts.map(normalizeCheck).filter(Boolean);
  const summary = summarizeChecks(checks);

  const pr = {
    id: repo.nameWithOwner + '#' + node.number,
    number: node.number,
    title: node.title,
    url: node.url,
    isDraft: !!node.isDraft,
    author: node.author ? { login: node.author.login, avatarUrl: node.author.avatarUrl, url: node.author.url } : null,
    baseRefName: node.baseRefName,
    headRefName: node.headRefName,
    isCrossRepository: !!node.isCrossRepository,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    mergeable: node.mergeable || 'UNKNOWN',
    mergeStateStatus: node.mergeStateStatus || 'UNKNOWN',
    reviewDecision: node.reviewDecision || null,
    comments: node.comments ? node.comments.totalCount : 0,
    additions: node.additions || 0,
    deletions: node.deletions || 0,
    changedFiles: node.changedFiles || 0,
    headSha: commit ? commit.oid : null,
    checks: { ...summary, items: checks },
    repo: {
      name: repo.name,
      nameWithOwner: repo.nameWithOwner,
      url: repo.url,
      isPrivate: !!repo.isPrivate,
      isArchived: !!repo.isArchived,
    },
  };

  pr.status = deriveStatus(pr);
  pr.canMerge = !pr.isDraft
    && !pr.repo.isArchived
    && pr.mergeable === 'MERGEABLE'
    && pr.mergeStateStatus !== 'BLOCKED'
    && pr.mergeStateStatus !== 'DIRTY'
    && pr.mergeStateStatus !== 'DRAFT';
  pr.canUpdateBranch = pr.mergeStateStatus === 'BEHIND' && !pr.isCrossRepository;
  // A run waiting for approval can be started from here, if we know which run it is.
  pr.canApprove = checks.some((check) => check.state === 'action_required' && check.runId);
  return pr;
}

/* ---------------------------------------------------------------- cache */

const cache = new Map();

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      out[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return out;
}

let viewerCache = null;

async function getViewer() {
  if (viewerCache) return viewerCache;
  const res = await apiFetch('/user');
  if (!res.ok) return null;
  const scopes = res.headers.get('x-oauth-scopes');
  viewerCache = {
    login: res.data.login,
    name: res.data.name || res.data.login,
    avatarUrl: res.data.avatar_url,
    url: res.data.html_url,
    scopes: scopes ? scopes.split(',').map((s) => s.trim()).filter(Boolean) : [],
  };
  return viewerCache;
}

async function buildOverview(owner, options) {
  const opts = options || {};
  const key = owner.toLowerCase();
  const cached = cache.get(key);
  if (!opts.refresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { ...cached.payload, cached: true };
  }

  const type = await detectOwnerType(owner);
  const allRepos = await listRepos(owner, type);
  const candidates = allRepos.filter((r) => !r.disabled).slice(0, MAX_REPOS);

  const chunks = [];
  for (let i = 0; i < candidates.length; i += REPOS_PER_QUERY) {
    chunks.push(candidates.slice(i, i + REPOS_PER_QUERY));
  }

  let rateLimit = null;
  const chunkResults = await mapLimit(chunks, 4, async (chunk) => {
    const payload = await graphql(buildQuery(owner, chunk));
    if (payload.data && payload.data.rateLimit) rateLimit = payload.data.rateLimit;
    return chunk.map((repo, index) => ({ repo, node: payload.data ? payload.data['r' + index] : null }));
  });

  const repos = [];
  const prs = [];
  for (const group of chunkResults) {
    for (const entry of group) {
      if (!entry.node) continue;
      const repoMeta = {
        name: entry.repo.name,
        nameWithOwner: entry.node.nameWithOwner || entry.repo.full_name,
        url: entry.node.url || entry.repo.html_url,
        isPrivate: !!entry.node.isPrivate,
        isArchived: !!entry.node.isArchived,
      };
      const nodes = entry.node.pullRequests && entry.node.pullRequests.nodes ? entry.node.pullRequests.nodes : [];
      if (nodes.length === 0) continue;
      const repoPrs = nodes.map((node) => normalizePr(node, repoMeta));
      repos.push({
        ...repoMeta,
        prs: repoPrs,
        totalCount: entry.node.pullRequests.totalCount,
        truncated: entry.node.pullRequests.totalCount > repoPrs.length,
      });
      prs.push(...repoPrs);
    }
  }

  repos.sort((a, b) => a.nameWithOwner.localeCompare(b.nameWithOwner));
  prs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const stats = {
    reposScanned: candidates.length,
    reposWithPrs: repos.length,
    prs: prs.length,
    ready: prs.filter((p) => p.status.key === 'ready').length,
    blocked: prs.filter((p) => ['blocked', 'conflicts', 'behind', 'failing', 'approval'].includes(p.status.key)).length,
    ciRunning: prs.filter((p) => p.checks.pending > 0).length,
    drafts: prs.filter((p) => p.isDraft).length,
    failing: prs.filter((p) => p.checks.failure > 0).length,
    needsApproval: prs.filter((p) => p.checks.action_required > 0).length,
  };

  const viewer = await getViewer();
  const payload = {
    owner,
    type,
    fetchedAt: Date.now(),
    viewer,
    rateLimit,
    stats,
    repos,
    prs,
  };
  cache.set(key, { at: Date.now(), payload });
  return { ...payload, cached: false };
}

/* --------------------------------------------------------------- actions */

function mergeErrorMessage(status, message) {
  if (status === 405) return 'GitHub says this pull request is not mergeable yet (required reviews, required checks, or conflicts).';
  if (status === 409) return 'The head branch changed while merging. Refresh and try again.';
  if (status === 403) return 'Your token does not have permission to merge this pull request.';
  if (status === 404) return 'Pull request not found, or your token cannot see it.';
  return message || 'GitHub refused the merge.';
}

async function handleMerge(body) {
  const owner = String(body.owner || '').trim();
  const repo = String(body.repo || '').trim();
  const number = Number(body.number);
  const method = ['merge', 'squash', 'rebase'].includes(body.method) ? body.method : 'merge';
  if (!owner || !repo || !Number.isInteger(number)) {
    throw new HttpError(400, 'owner, repo and number are required.');
  }

  const res = await apiFetch('/repos/' + owner + '/' + repo + '/pulls/' + number + '/merge', {
    method: 'PUT',
    body: { merge_method: method },
  });

  if (!res.ok) {
    throw new HttpError(res.status, mergeErrorMessage(res.status, apiMessage(res, '')), {
      url: 'https://github.com/' + owner + '/' + repo + '/pull/' + number,
    });
  }

  let branchDeleted = false;
  let branchDeleteError = null;
  if (body.deleteBranch) {
    try {
      const prRes = await apiFetch('/repos/' + owner + '/' + repo + '/pulls/' + number);
      const head = prRes.ok && prRes.data ? prRes.data.head : null;
      const branch = head ? head.ref : null;
      const headRepo = head && head.repo ? head.repo.full_name : null;
      if (branch && headRepo && headRepo.toLowerCase() === (owner + '/' + repo).toLowerCase()) {
        const refPath = branch.split('/').map(encodeURIComponent).join('/');
        const del = await apiFetch('/repos/' + owner + '/' + repo + '/git/refs/heads/' + refPath, { method: 'DELETE' });
        branchDeleted = del.ok || del.status === 204;
        if (!branchDeleted) branchDeleteError = apiMessage(del, 'Could not delete the branch.');
      } else if (branch) {
        branchDeleteError = 'Branch lives in a fork, so it was left alone.';
      }
    } catch (err) {
      branchDeleteError = err.message;
    }
  }

  cache.delete(owner.toLowerCase());
  return {
    merged: true,
    sha: res.data ? res.data.sha : null,
    message: (res.data && res.data.message) || 'Pull request merged.',
    branchDeleted,
    branchDeleteError,
  };
}

async function handleUpdateBranch(body) {
  const owner = String(body.owner || '').trim();
  const repo = String(body.repo || '').trim();
  const number = Number(body.number);
  if (!owner || !repo || !Number.isInteger(number)) throw new HttpError(400, 'owner, repo and number are required.');
  const res = await apiFetch('/repos/' + owner + '/' + repo + '/pulls/' + number + '/update-branch', {
    method: 'PUT',
    body: body.expectedHeadSha ? { expected_head_sha: body.expectedHeadSha } : {},
  });
  if (!res.ok) throw new HttpError(res.status, apiMessage(res, 'Could not update the branch.'));
  cache.delete(owner.toLowerCase());
  return { message: (res.data && res.data.message) || 'Branch updated.' };
}

async function handleRerun(body) {
  const owner = String(body.owner || '').trim();
  const repo = String(body.repo || '').trim();
  const runId = String(body.runId || '').trim();
  if (!owner || !repo || !runId) throw new HttpError(400, 'owner, repo and runId are required.');
  const res = await apiFetch('/repos/' + owner + '/' + repo + '/actions/runs/' + encodeURIComponent(runId) + '/rerun-failed-jobs', {
    method: 'POST',
  });
  if (!res.ok) throw new HttpError(res.status, apiMessage(res, 'Could not re-run the failed jobs.'));
  cache.delete(owner.toLowerCase());
  return { message: 'Re-running failed jobs.' };
}

/**
 * Start a run that GitHub is holding for approval (a bot's PR, a first-time contributor).
 * The run exists but has no jobs until someone approves it.
 */
async function handleApprove(body) {
  const owner = String(body.owner || '').trim();
  const repo = String(body.repo || '').trim();
  const runId = String(body.runId || '').trim();
  if (!owner || !repo || !runId) throw new HttpError(400, 'owner, repo and runId are required.');
  const res = await apiFetch('/repos/' + owner + '/' + repo + '/actions/runs/' + encodeURIComponent(runId) + '/approve', {
    method: 'POST',
  });
  if (!res.ok) throw new HttpError(res.status, apiMessage(res, 'Could not approve the run.'));
  cache.delete(owner.toLowerCase());
  return { message: 'Approved; the run is starting.' };
}

/* ------------------------------------------------------------------ http */

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new HttpError(413, 'Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function serveStatic(res, pathname) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const target = path.resolve(PUBLIC_DIR, rel);
  if (!target.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const file = await readFile(target);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(file);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

async function handleApi(req, res, url) {
  const route = url.pathname;

  if (route === '/api/health') {
    return sendJson(res, 200, { ok: true, version: '1.0.0' });
  }

  if (route === '/api/auth') {
    const token = await resolveToken();
    const viewer = await getViewer();
    return sendJson(res, 200, { source: token.source, viewer });
  }

  if (route === '/api/overview') {
    const owner = String(url.searchParams.get('owner') || '').trim();
    if (!owner) throw new HttpError(400, 'Pass ?owner=<org-or-user>.');
    if (!/^[A-Za-z0-9-]+$/.test(owner)) throw new HttpError(400, 'That does not look like a GitHub org or username.');
    const payload = await buildOverview(owner, { refresh: url.searchParams.get('refresh') === '1' });
    return sendJson(res, 200, payload);
  }

  if (route === '/api/merge' && req.method === 'POST') {
    return sendJson(res, 200, await handleMerge(await readJson(req)));
  }

  if (route === '/api/update-branch' && req.method === 'POST') {
    return sendJson(res, 200, await handleUpdateBranch(await readJson(req)));
  }

  if (route === '/api/rerun' && req.method === 'POST') {
    return sendJson(res, 200, await handleRerun(await readJson(req)));
  }

  if (route === '/api/approve' && req.method === 'POST') {
    return sendJson(res, 200, await handleApprove(await readJson(req)));
  }

  throw new HttpError(404, 'Unknown endpoint: ' + route);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else {
      await serveStatic(res, url.pathname);
    }
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status >= 500) console.error('[pr-deck]', err);
    if (!res.headersSent) {
      sendJson(res, status, { error: err.message || 'Unexpected error', detail: err.extra || null });
    } else {
      res.end();
    }
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Try: PORT=4318 npm start');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, async () => {
  const url = 'http://' + HOST + ':' + PORT;
  console.log('');
  console.log('  PR Deck  ' + url);
  try {
    const token = await resolveToken();
    const viewer = await getViewer();
    console.log('  Auth     ' + (viewer ? viewer.login : 'unknown') + ' via ' + (token.source === 'env' ? 'GITHUB_TOKEN' : 'gh CLI'));
  } catch (err) {
    console.log('  Auth     not available - ' + err.message);
  }
  console.log('');
  if (process.env.OPEN === '1' || process.argv.includes('--open')) {
    const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    execFile(opener, [url], () => {});
  }
});
