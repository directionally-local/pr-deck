/* PR Deck - front end. No framework, no build step. */

const ICONS = {
  gitPullRequest: 'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z',
  gitMerge: 'M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
  check: 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z',
  x: 'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z',
  dotFill: 'M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z',
  chevronDown: 'M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z',
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z',
  alert: 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  checkCircle: 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.25 5.25a.75.75 0 0 1-1.06 0L2.72 8.78a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 9.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z',
  xCircle: 'M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 6.03a.749.749 0 0 0-1.06 1.06L5.94 8l-1.97 1.97a.749.749 0 0 0 1.06 1.06L7 9.06l1.97 1.97a.749.749 0 0 0 1.06-1.06L8.06 8l1.97-1.97a.749.749 0 0 0-.018-1.042.749.749 0 0 0-1.042-.018L8 6.94 6.03 4.97Z',
  info: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  skip: 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z',
  linkExternal: 'M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z',
  shield: 'M7.467.133a1.748 1.748 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.697 1.697 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667Zm.61 1.429a.25.25 0 0 0-.153 0l-5.25 1.68a.25.25 0 0 0-.174.238V7c0 1.358.275 2.666 1.057 3.86.784 1.194 2.121 2.34 4.366 3.297a.196.196 0 0 0 .154 0c2.245-.956 3.582-2.104 4.366-3.298C13.225 9.666 13.5 8.36 13.5 7V3.48a.251.251 0 0 0-.174-.237l-5.25-1.68ZM11.22 5.72a.749.749 0 0 1 0 1.06l-2.5 2.5a.749.749 0 0 1-1.06 0l-1.25-1.25a.749.749 0 1 1 1.06-1.06l.72.72 1.97-1.97a.749.749 0 0 1 1.06 0Z',
  inbox: 'M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Zm10.09 7h-2.875l-1.275 1.7a.75.75 0 0 1-.6.3h-3.5a.75.75 0 0 1-.6-.3L4.375 9.5H1.5v3.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z',
  lock: 'M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z',
};

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const state = {
  owner: '',
  data: null,
  loading: false,
  error: null,
  expanded: new Set(),
  collapsedRepos: new Set(),
  busy: new Set(),
  lastLoaded: 0,
  autoRefresh: true,
  viewer: null,
  modalPr: null,
};

const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function icon(name, cls) {
  const d = ICONS[name];
  if (!d) return '';
  return '<svg class="octicon ' + (cls || '') + '" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="' + d + '"/></svg>';
}

function spinner(cls) {
  return '<span class="spinner ' + (cls || '') + '" role="status" aria-label="Loading"></span>';
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.round(diff / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.round(hours / 24);
  if (days < 30) return days + 'd ago';
  const months = Math.round(days / 30);
  if (months < 12) return months + 'mo ago';
  return Math.round(months / 12) + 'y ago';
}

function duration(start, end) {
  if (!start || !end) return '';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!(ms > 0)) return '';
  const total = Math.round(ms / 1000);
  if (total < 60) return total + 's';
  return Math.floor(total / 60) + 'm ' + (total % 60) + 's';
}

/* ------------------------------------------------------------------ data */

async function load(owner, options) {
  const opts = options || {};
  if (!owner) return;
  const changed = owner !== state.owner;
  state.owner = owner;
  localStorage.setItem('prdeck.owner', owner);
  rememberOwner(owner);
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', '?owner=' + encodeURIComponent(owner));
  }

  if (!opts.silent) {
    state.loading = true;
    state.error = null;
    if (changed) state.data = null;
    render();
  }
  setProgress(true);

  try {
    const url = '/api/overview?owner=' + encodeURIComponent(owner) + (opts.refresh ? '&refresh=1' : '');
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Request failed (' + res.status + ')');
    state.data = json;
    state.error = null;
    state.lastLoaded = Date.now();
    if (json.viewer) state.viewer = json.viewer;
    if (changed) {
      state.expanded.clear();
      state.collapsedRepos.clear();
    }
  } catch (err) {
    state.error = err.message || 'Something went wrong';
    if (opts.silent) toast('error', state.error);
  } finally {
    state.loading = false;
    setProgress(false);
    render();
  }
}

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(json.error || 'Request failed (' + res.status + ')');
    error.detail = json.detail || null;
    throw error;
  }
  return json;
}

function setProgress(on) {
  $('progress').classList.toggle('active', !!on);
}

/* --------------------------------------------------------------- render */

function render() {
  renderViewer();
  renderList();
}

function renderViewer() {
  const node = $('viewer');
  const viewer = state.viewer || (state.data && state.data.viewer);
  if (!viewer) {
    node.hidden = true;
    return;
  }
  node.hidden = false;
  node.innerHTML = '<img src="' + esc(viewer.avatarUrl) + '" alt="" width="20" height="20" />'
    + '<span><strong>' + esc(viewer.login) + '</strong> · gh CLI</span>';
}

function renderList() {
  const content = $('content');

  if (state.loading && !state.data) {
    content.innerHTML = skeleton();
    return;
  }
  if (state.error && !state.data) {
    content.innerHTML = errorState();
    return;
  }
  if (!state.data) {
    content.innerHTML = welcome();
    return;
  }

  const prs = state.data.prs;
  if (prs.length === 0) {
    content.innerHTML = emptyState();
    return;
  }

  const groups = new Map();
  for (const pr of prs) {
    if (!groups.has(pr.repo.nameWithOwner)) groups.set(pr.repo.nameWithOwner, { repo: pr.repo, prs: [] });
    groups.get(pr.repo.nameWithOwner).prs.push(pr);
  }

  content.innerHTML = Array.from(groups.values()).map(repoGroup).join('');
}

function repoGroup(group) {
  const repo = group.repo;
  const collapsed = state.collapsedRepos.has(repo.nameWithOwner);
  const parts = repo.nameWithOwner.split('/');
  return '<section class="repo-group' + (collapsed ? ' collapsed' : '') + '" data-repo="' + esc(repo.nameWithOwner) + '">'
    + '<header class="repo-head">'
    + '<button type="button" class="repo-toggle" data-action="toggle-repo" data-repo="' + esc(repo.nameWithOwner) + '" aria-expanded="' + (!collapsed) + '">'
    + icon('chevronDown', 'chevron')
    + icon('repo')
    + '<span class="repo-name"><span class="repo-owner">' + esc(parts[0]) + '/</span>' + esc(parts[1]) + '</span>'
    + (repo.isPrivate ? '<span class="label label-muted">' + icon('lock') + 'Private</span>' : '')
    + '<span class="counter">' + group.prs.length + '</span>'
    + '</button>'
    + '<a class="repo-link" href="' + esc(repo.url) + '" target="_blank" rel="noreferrer">Open repo ' + icon('linkExternal') + '</a>'
    + '</header>'
    + '<div class="repo-prs">' + group.prs.map(prRow).join('') + '</div>'
    + '</section>';
}

function prRow(pr) {
  const expanded = state.expanded.has(pr.id);
  const busy = state.busy.has(pr.id);
  return '<article class="pr" data-id="' + esc(pr.id) + '">'
    + '<div class="pr-row">'
    + '<span class="pr-state tone-' + pr.status.tone + '">' + icon('gitPullRequest') + '</span>'
    + '<div class="pr-main">'
    + '<div class="pr-title-line">'
    + '<a class="pr-title" href="' + esc(pr.url) + '" target="_blank" rel="noreferrer" title="' + esc(pr.title) + '">' + esc(pr.title) + '</a>'
    + '<span class="pr-number">#' + pr.number + '</span>'
    + '</div>'
    + '<div class="pr-meta">'
    + (pr.author ? '<img class="avatar" src="' + esc(pr.author.avatarUrl) + '" alt="" width="16" height="16" loading="lazy" />' : '')
    + (pr.author ? '<span class="pr-author">' + esc(pr.author.login) + '</span>' : '')
    + '<span class="dot">·</span>'
    + '<span class="branch-pair"><code title="' + esc(pr.headRefName) + '">' + esc(pr.headRefName) + '</code><span class="arrow">→</span><code title="' + esc(pr.baseRefName) + '">' + esc(pr.baseRefName) + '</code></span>'
    + '<span class="dot">·</span>'
    + '<span title="' + esc(pr.updatedAt) + '">updated ' + relativeTime(pr.updatedAt) + '</span>'
    + '<span class="dot">·</span>'
    + '<span class="diffstat"><span class="add">+' + pr.additions + '</span><span class="del">−' + pr.deletions + '</span></span>'
    + '</div>'
    + '</div>'
    + '<div class="pr-badges">'
    + checksBadge(pr)
    + reviewBadge(pr)
    + '<span class="label label-' + pr.status.tone + '">' + esc(pr.status.label) + '</span>'
    + '</div>'
    + '<div class="pr-actions">'
    + '<a class="btn btn-sm" href="' + esc(pr.url) + '" target="_blank" rel="noreferrer" title="Open pull request on GitHub">Open ' + icon('linkExternal') + '</a>'
    + mergeButton(pr, busy)
    + '<button type="button" class="btn btn-sm btn-icon" data-action="expand" data-id="' + esc(pr.id) + '" aria-expanded="' + expanded + '" title="' + (expanded ? 'Hide checks' : 'Show checks') + '">'
    + icon('chevronDown', 'chevron' + (expanded ? '' : ' rotated')) + '</button>'
    + '</div>'
    + '</div>'
    + (expanded ? detailPanel(pr) : '')
    + '</article>';
}

function checksBadge(pr) {
  const c = pr.checks;
  if (c.total === 0) return '<span class="checks checks-muted">' + icon('dotFill') + 'No checks</span>';
  if (c.pending > 0) {
    return '<span class="checks checks-pending">' + spinner('spinner-sm') + c.pending + ' running · ' + c.success + '/' + c.total + '</span>';
  }
  if (c.failure > 0) {
    return '<span class="checks checks-danger">' + icon('x') + c.failure + ' failing · ' + c.success + '/' + c.total + '</span>';
  }
  return '<span class="checks checks-success">' + icon('check') + c.success + '/' + c.total + ' checks</span>';
}

function reviewBadge(pr) {
  if (pr.reviewDecision === 'APPROVED') return '<span class="label label-success">' + icon('shield') + 'Approved</span>';
  if (pr.reviewDecision === 'CHANGES_REQUESTED') return '<span class="label label-danger">' + icon('shield') + 'Changes requested</span>';
  if (pr.reviewDecision === 'REVIEW_REQUIRED') return '<span class="label label-attention">' + icon('shield') + 'Review required</span>';
  return '';
}

function mergeButton(pr, busy) {
  if (busy) {
    return '<button type="button" class="btn btn-sm btn-primary" disabled>' + spinner('spinner-sm') + 'Merging</button>';
  }
  if (pr.canMerge) {
    return '<button type="button" class="btn btn-sm btn-primary" data-action="merge" data-id="' + esc(pr.id) + '">' + icon('gitMerge') + 'Merge</button>';
  }
  const reason = pr.isDraft ? 'Draft pull requests cannot be merged'
    : pr.repo.isArchived ? 'This repository is archived'
    : pr.mergeable === 'CONFLICTING' ? 'Resolve merge conflicts on GitHub first'
    : pr.mergeStateStatus === 'BLOCKED' ? 'Blocked by required reviews or checks'
    : 'Not mergeable right now';
  return '<button type="button" class="btn btn-sm" disabled title="' + esc(reason) + '">' + icon('gitMerge') + 'Merge</button>';
}

function detailPanel(pr) {
  const items = pr.checks.items;
  const rows = items.length
    ? items.map(checkRow).join('')
    : '<li class="check-item"><span class="tone-muted">' + icon('dotFill') + '</span><span class="check-name">No checks reported for this commit</span></li>';

  const failedRuns = [];
  const approvalRuns = [];
  for (const item of items) {
    if (item.state === 'failure' && item.runId && !failedRuns.includes(item.runId)) failedRuns.push(item.runId);
    if (item.state === 'action_required' && item.runId && !approvalRuns.includes(item.runId)) approvalRuns.push(item.runId);
  }

  return '<div class="pr-detail">'
    + '<div class="detail-grid">'
    + '<div class="checks-panel">'
    + '<div class="panel-title"><span>Checks</span><span class="spacer"></span>'
    + '<a href="' + esc(pr.url) + '/checks" target="_blank" rel="noreferrer">View on GitHub ' + icon('linkExternal') + '</a></div>'
    + '<ul class="check-list">' + rows + '</ul>'
    + (approvalRuns.length > 0
      ? '<div class="detail-actions" style="margin-top:8px"><button type="button" class="btn btn-sm" data-action="approve" data-id="' + esc(pr.id) + '" data-run="' + esc(approvalRuns[0]) + '">' + icon('lock') + 'Approve and run</button></div>'
      : '')
    + (failedRuns.length > 0
      ? '<div class="detail-actions" style="margin-top:8px"><button type="button" class="btn btn-sm" data-action="rerun" data-id="' + esc(pr.id) + '" data-run="' + esc(failedRuns[0]) + '">Re-run failed jobs</button></div>'
      : '')
    + '</div>'
    + '<div class="detail-side">'
    + '<div class="detail-card">'
    + '<h4>Merge state</h4>'
    + '<div class="detail-row"><span>Status</span><span class="tone-' + pr.status.tone + '">' + esc(pr.status.label) + '</span></div>'
    + '<div class="detail-row"><span>Mergeable</span><span>' + esc(String(pr.mergeable).toLowerCase()) + '</span></div>'
    + '<div class="detail-row"><span>Review</span><span>' + esc(reviewText(pr)) + '</span></div>'
    + '<div class="detail-row"><span>Files</span><span>' + pr.changedFiles + ' changed</span></div>'
    + '<div class="detail-row"><span>Comments</span><span>' + pr.comments + '</span></div>'
    + '</div>'
    + '<div class="detail-actions">'
    + (pr.canUpdateBranch ? '<button type="button" class="btn btn-sm" data-action="update-branch" data-id="' + esc(pr.id) + '">Update branch</button>' : '')
    + '<a class="btn btn-sm" href="' + esc(pr.url) + '" target="_blank" rel="noreferrer">Open on GitHub ' + icon('linkExternal') + '</a>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '</div>';
}

function reviewText(pr) {
  if (pr.reviewDecision === 'APPROVED') return 'Approved';
  if (pr.reviewDecision === 'CHANGES_REQUESTED') return 'Changes requested';
  if (pr.reviewDecision === 'REVIEW_REQUIRED') return 'Review required';
  return 'No review required';
}

function checkRow(check) {
  let stateIcon = icon('dotFill', 'tone-muted');
  if (check.state === 'success') stateIcon = icon('check', 'tone-success');
  else if (check.state === 'failure') stateIcon = icon('x', 'tone-danger');
  else if (check.state === 'pending') stateIcon = spinner('spinner-sm tone-attention');
  else if (check.state === 'skipped') stateIcon = icon('skip', 'tone-muted');
  else if (check.state === 'cancelled') stateIcon = icon('x', 'tone-muted');
  else if (check.state === 'action_required') stateIcon = icon('lock', 'tone-attention');

  const dur = duration(check.startedAt, check.completedAt);
  return '<li class="check-item">'
    + stateIcon
    + '<span class="check-name" title="' + esc(check.name) + '">' + esc(check.name) + '</span>'
    + (check.workflow ? '<span class="check-wf">' + esc(check.workflow) + '</span>' : '')
    + (dur ? '<span class="check-dur">' + dur + '</span>' : '')
    + (check.url ? '<a class="check-link" href="' + esc(check.url) + '" target="_blank" rel="noreferrer">Details</a>' : '')
    + '</li>';
}

function skeleton() {
  const row = '<div class="skeleton-row">'
    + '<span class="sk" style="width:16px;height:16px;border-radius:50%"></span>'
    + '<span class="sk" style="flex:1;max-width:420px"></span>'
    + '<span class="sk" style="width:90px"></span>'
    + '<span class="sk" style="width:70px"></span>'
    + '</div>';
  return '<div class="skeleton-group"><div class="skeleton-head"></div>' + row + row + row + '</div>'
    + '<div class="skeleton-group"><div class="skeleton-head"></div>' + row + row + '</div>';
}

function welcome() {
  const recent = recentOwners();
  return '<div class="empty">'
    + icon('gitPullRequest')
    + '<h3>Every open pull request, one screen</h3>'
    + '<p>Type an organization or username above. PR Deck lists every repo with open PRs, shows what is blocking each one, and lets you merge without leaving the page.</p>'
    + (recent.length
      ? '<div class="recent">' + recent.map((name) => '<button type="button" class="chip" data-action="recent" data-owner="' + esc(name) + '">' + esc(name) + '</button>').join('') + '</div>'
      : '')
    + '</div>';
}

function emptyState() {
  return '<div class="empty">' + icon('inbox')
    + '<h3>No open pull requests</h3>'
    + '<p>' + esc(state.data.owner) + ' has ' + state.data.stats.reposScanned + ' repositories and none of them have an open pull request right now.</p>'
    + '<div class="empty-actions"><a class="btn" href="https://github.com/' + esc(state.data.owner) + '" target="_blank" rel="noreferrer">Open ' + esc(state.data.owner) + ' on GitHub ' + icon('linkExternal') + '</a></div>'
    + '</div>';
}

function errorState() {
  const message = state.error || 'Something went wrong';
  const authIssue = message.toLowerCase().includes('gh auth') || message.toLowerCase().includes('token');
  return '<div class="empty">' + icon('alert')
    + '<h3>Could not load ' + esc(state.owner || 'that account') + '</h3>'
    + '<p>' + esc(message) + '</p>'
    + (authIssue ? '<p class="muted">Run <code>gh auth login</code> in your terminal, then retry.</p>' : '')
    + '<div class="empty-actions"><button type="button" class="btn btn-primary" data-action="retry">Try again</button></div>'
    + '</div>';
}

/* ---------------------------------------------------------------- toasts */

function toast(kind, message, options) {
  const opts = options || {};
  const node = document.createElement('div');
  node.className = 'toast toast-' + kind;
  const iconName = kind === 'success' ? 'checkCircle' : kind === 'error' ? 'xCircle' : 'info';
  node.innerHTML = '<span class="toast-icon">' + icon(iconName) + '</span>'
    + '<div class="toast-body"><span class="toast-msg">' + esc(message) + '</span>'
    + (opts.link ? '<a class="toast-link" href="' + esc(opts.link) + '" target="_blank" rel="noreferrer">Open on GitHub ' + icon('linkExternal') + '</a>' : '')
    + '</div>'
    + '<button type="button" class="toast-close" aria-label="Dismiss">×</button>';

  const remove = () => {
    if (!node.isConnected) return;
    node.classList.add('leaving');
    setTimeout(() => node.remove(), 180);
  };
  node.querySelector('.toast-close').addEventListener('click', remove);
  $('toasts').appendChild(node);
  setTimeout(remove, opts.timeout || (kind === 'error' ? 10000 : 5000));
}

/* ----------------------------------------------------------------- modal */

function openMergeModal(pr) {
  state.modalPr = pr;
  const root = $('modal-root');
  const method = localStorage.getItem('prdeck.method') || 'squash';
  const deleteDefault = !pr.isCrossRepository;

  root.hidden = false;
  root.innerHTML = '<div class="modal-backdrop" data-action="close-modal"></div>'
    + '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">'
    + '<div class="modal-head"><h2 id="modal-title">Merge pull request</h2>'
    + '<button type="button" class="btn btn-sm btn-icon" data-action="close-modal" aria-label="Close">' + icon('x') + '</button></div>'
    + '<div class="modal-body">'
    + '<p class="modal-pr"><span class="repo-name">' + esc(pr.repo.nameWithOwner) + '</span><span>#' + pr.number + '</span></p>'
    + '<p class="modal-title-text">' + esc(pr.title) + '</p>'
    + '<fieldset class="methods">'
    + methodOption('merge', 'Create a merge commit', 'All commits from this branch will be added to the base branch via a merge commit.', method)
    + methodOption('squash', 'Squash and merge', 'The commits from this branch will be combined into one commit in the base branch.', method)
    + methodOption('rebase', 'Rebase and merge', 'The commits from this branch will be rebased and added to the base branch.', method)
    + '</fieldset>'
    + '<label class="check"><input type="checkbox" id="delete-branch"' + (deleteDefault ? ' checked' : '') + ' /> Delete branch after merge</label>'
    + (pr.status.key !== 'ready'
      ? '<div class="modal-warning">' + icon('alert') + '<span>GitHub currently reports this pull request as <strong>' + esc(pr.status.label) + '</strong>. The merge may be rejected.</span></div>'
      : '')
    + '</div>'
    + '<div class="modal-foot">'
    + '<a class="btn btn-sm" href="' + esc(pr.url) + '" target="_blank" rel="noreferrer">Open on GitHub ' + icon('linkExternal') + '</a>'
    + '<span class="spacer"></span>'
    + '<button type="button" class="btn" data-action="close-modal">Cancel</button>'
    + '<button type="button" class="btn btn-primary" data-action="confirm-merge" data-id="' + esc(pr.id) + '">' + icon('gitMerge') + 'Merge pull request</button>'
    + '</div>'
    + '</div>';

  const first = root.querySelector('input[name="method"]:checked');
  if (first) first.focus();
}

function methodOption(value, title, description, selected) {
  return '<label class="method"><input type="radio" name="method" value="' + value + '"' + (value === selected ? ' checked' : '') + ' />'
    + '<span><strong>' + esc(title) + '</strong><small>' + esc(description) + '</small></span></label>';
}

function closeModal() {
  const root = $('modal-root');
  root.hidden = true;
  root.innerHTML = '';
  state.modalPr = null;
}

async function confirmMerge(button) {
  const pr = state.modalPr;
  if (!pr) return;
  const checked = document.querySelector('input[name="method"]:checked');
  const method = checked ? checked.value : 'squash';
  const deleteBranch = $('delete-branch') ? $('delete-branch').checked : false;

  localStorage.setItem('prdeck.method', method);
  button.disabled = true;
  button.innerHTML = spinner('spinner-sm') + 'Merging…';

  try {
    const result = await post('/api/merge', {
      owner: pr.repo.nameWithOwner.split('/')[0],
      repo: pr.repo.name,
      number: pr.number,
      method,
      deleteBranch,
    });
    closeModal();
    let message = 'Merged ' + pr.repo.nameWithOwner + '#' + pr.number;
    if (result.branchDeleted) message += ' and deleted the branch';
    else if (result.branchDeleteError) message += ' (' + result.branchDeleteError + ')';
    toast('success', message, { link: pr.url });
    await load(state.owner, { refresh: true, silent: true });
  } catch (err) {
    button.disabled = false;
    button.innerHTML = icon('gitMerge') + 'Merge pull request';
    toast('error', err.message, { link: pr.url, timeout: 12000 });
  }
}

/* ---------------------------------------------------------------- actions */

async function doUpdateBranch(pr, button) {
  button.disabled = true;
  button.innerHTML = spinner('spinner-sm') + 'Updating…';
  try {
    await post('/api/update-branch', {
      owner: pr.repo.nameWithOwner.split('/')[0],
      repo: pr.repo.name,
      number: pr.number,
      expectedHeadSha: pr.headSha,
    });
    toast('success', 'Updated ' + pr.repo.nameWithOwner + '#' + pr.number + ' from the base branch', { link: pr.url });
    await load(state.owner, { refresh: true, silent: true });
  } catch (err) {
    button.disabled = false;
    button.textContent = 'Update branch';
    toast('error', err.message, { link: pr.url });
  }
}

async function doRerun(pr, runId, button) {
  button.disabled = true;
  button.innerHTML = spinner('spinner-sm') + 'Re-running…';
  try {
    await post('/api/rerun', {
      owner: pr.repo.nameWithOwner.split('/')[0],
      repo: pr.repo.name,
      runId,
    });
    toast('success', 'Re-running failed jobs for ' + pr.repo.nameWithOwner + '#' + pr.number, { link: pr.url });
    setTimeout(() => load(state.owner, { refresh: true, silent: true }), 2500);
  } catch (err) {
    button.disabled = false;
    button.textContent = 'Re-run failed jobs';
    toast('error', err.message, { link: pr.url });
  }
}

async function doApprove(pr, runId, button) {
  button.disabled = true;
  button.innerHTML = spinner('spinner-sm') + 'Approving…';
  try {
    await post('/api/approve', {
      owner: pr.repo.nameWithOwner.split('/')[0],
      repo: pr.repo.name,
      runId,
    });
    toast('success', 'Approved the run for ' + pr.repo.nameWithOwner + '#' + pr.number, { link: pr.url });
    setTimeout(() => load(state.owner, { refresh: true, silent: true }), 2500);
  } catch (err) {
    button.disabled = false;
    button.textContent = 'Approve and run';
    toast('error', err.message, { link: pr.url });
  }
}

function prById(id) {
  if (!state.data) return null;
  return state.data.prs.find((pr) => pr.id === id) || null;
}

/* ------------------------------------------------------------- persistence */

function recentOwners() {
  try {
    const parsed = JSON.parse(localStorage.getItem('prdeck.recent') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rememberOwner(owner) {
  const list = recentOwners().filter((name) => name.toLowerCase() !== owner.toLowerCase());
  list.unshift(owner);
  localStorage.setItem('prdeck.recent', JSON.stringify(list.slice(0, 6)));
}

/* ------------------------------------------------------------------ theme */

function applyTheme(preference) {
  const stored = preference || localStorage.getItem('prdeck.theme') || 'auto';
  localStorage.setItem('prdeck.theme', stored);
  const resolved = stored === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : stored;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-theme-preference', stored);
}

function cycleTheme() {
  const current = localStorage.getItem('prdeck.theme') || 'auto';
  const next = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
  applyTheme(next);
  toast('info', 'Theme: ' + next, { timeout: 2000 });
}

/* ----------------------------------------------------------------- events */

function bind() {
  $('owner-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = $('owner-input').value.trim();
    if (!value) {
      $('owner-input').focus();
      return;
    }
    load(value);
  });

  $('refresh-btn').addEventListener('click', () => {
    if (!state.owner) {
      $('owner-input').focus();
      return;
    }
    load(state.owner, { refresh: true });
  });

  $('theme-btn').addEventListener('click', cycleTheme);

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;

    if (action === 'recent') {
      $('owner-input').value = target.dataset.owner;
      load(target.dataset.owner);
      return;
    }

    if (action === 'retry') {
      load(state.owner, { refresh: true });
      return;
    }

    if (action === 'toggle-repo') {
      const repo = target.dataset.repo;
      if (state.collapsedRepos.has(repo)) state.collapsedRepos.delete(repo);
      else state.collapsedRepos.add(repo);
      renderList();
      return;
    }

    if (action === 'expand') {
      const id = target.dataset.id;
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);
      renderList();
      return;
    }

    if (action === 'merge') {
      const pr = prById(target.dataset.id);
      if (pr) openMergeModal(pr);
      return;
    }

    if (action === 'close-modal') {
      closeModal();
      return;
    }

    if (action === 'confirm-merge') {
      confirmMerge(target);
      return;
    }

    if (action === 'update-branch') {
      const pr = prById(target.dataset.id);
      if (pr) doUpdateBranch(pr, target);
      return;
    }

    if (action === 'rerun') {
      const pr = prById(target.dataset.id);
      if (pr) doRerun(pr, target.dataset.run, target);
    }

    if (action === 'approve') {
      const pr = prById(target.dataset.id);
      if (pr) doApprove(pr, target.dataset.run, target);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('modal-root').hidden) {
      closeModal();
      return;
    }
    const tag = document.activeElement ? document.activeElement.tagName : '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (typing) return;
    if (event.key === 'r' && state.owner) {
      event.preventDefault();
      load(state.owner, { refresh: true });
    }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('prdeck.theme') || 'auto') === 'auto') applyTheme('auto');
  });
}

/* ------------------------------------------------------------------- boot */

function maybeAutoRefresh() {
  if (!state.owner || state.loading) return;
  if (document.visibilityState !== 'visible') return;
  if (Date.now() - state.lastLoaded < 60000) return;
  load(state.owner, { refresh: true, silent: true });
}

function init() {
  applyTheme(localStorage.getItem('prdeck.theme') || 'auto');

  const params = new URLSearchParams(window.location.search);
  const saved = params.get('owner') || localStorage.getItem('prdeck.owner') || '';
  $('owner-input').value = saved;

  bind();
  render();

  if (saved) load(saved);
  else $('owner-input').focus();

  setInterval(maybeAutoRefresh, 15000);
}

init();
