// There is no way to get the short-hand month in Javascript, so instead
// we call this wrapper function to wrap Date.
function formatTime(timestamp) {
    var ts = new Date(timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                  'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[ts.getMonth()]+' '+ts.getDate();
}

// Represent a link to a repository
function repoLink(name) {
    return '<a class="repo" href="https://github.com/'+name+'">'+name+'</a>';
}

// Represent a link to a specific branch of a repository
function branchLink(repo, branch) {
    return '<a class="branch" '+
           'href="https://github.com/'+repo+'/tree/'+branch+'">'+
            branch+'</a>';
}

// Represent a link to an issue in a repository
function issueLink(url, number) {
    return '<a class="pullreq" href="'+url+'">&#35;'+number+'</a>';
}

// Find all repositories for a user and fill in a blank div with the
// contents after formatting it into style-able HTML.
function githubRepos(username) {
    var gh = new Octokit({username:username});
    var user = gh.getUser(username);
    var html = "";
    user.getRepos().done(function(repos) {
        repos.forEach(function(repo) {
            html += "<div class='repo'>";
            html += "<div class='name'>";
            if (repo.fork) {
                html += "<a href='"+repo.html_url+"'>"+repo.name+"</a></div>";
                html += "<div class='contrib'>contributor</div>";
                var html_url = "";
                var real_repo = gh.getRepo(username, repo.name);
                real_repo.getInfo().done(function(real_repo, html_url) {
                    html_url = real_repo.parent.html_url;
                });
                alert(html_url);
            }
            html += "<div class='description'>"+repo.description+"</div>";
            html += "</div>";
        });
        document.getElementById('github').style.display = 'none';
        document.getElementById('github').innerHTML = html;
        $('#github').fadeIn({duration: 800});
    });
}

// Pull the GitHub API and fill in a blank div with the resulting content
// after parsing it into HTML.
function githubActivity(user) {
    var gh = new Octokit({username:user});
    var user = gh.getUser(user);
    user.getEvents().done(function(events) {
        var max = 30;
        var displayed = 0;
        var html = "";
        var result = {};
        events.forEach(function(ue) {
            if (displayed >= max) {
                return;
            }
            var day = formatTime(ue.created_at);
            if (!(day in result)) {
                result[day] = [];
            }
            switch(ue.type) {
            case 'PushEvent':
                displayed++;
                var commits = ue.payload.commits.length;
                var commit_word = (commits > 1 ? "commits" : "commit")
                result[day].push(
                    'Pushed '+commits+' '+commit_word+' to '+
                    branchLink(ue.repo.name,
                               ue.payload.ref.replace(/^.*\//, ''))+
                    '<br>'+repoLink(ue.repo.name));
                break;

            case 'CreateEvent':
                if (ue.payload.ref_type == 'branch') {
                    displayed++;
                    result[day].push(
                        'Created branch '+
                        branchLink(ue.repo.name, ue.payload.ref)+
                        '<br>'+repoLink(ue.repo.name));
                }
                break;

            case 'DeleteEvent':
                if (ue.payload.ref_type == 'branch') {
                    displayed++;
                    result[day].push('Deleted branch <b>'+ue.payload.ref+'</b>'+
                                     '<br>'+repoLink(ue.repo.name));
                }
                break;

            case 'PullRequestEvent':
                displayed++;
                verb = ue.payload.action.charAt(0).toUpperCase()+
                       ue.payload.action.slice(1);
                result[day].push(
                    verb+' pull request '+
                    issueLink(ue.payload.pull_request.html_url,
                                    ue.payload.number)+
                    '<br>'+repoLink(ue.repo.name));
                break;

            case 'IssueCommentEvent':
                // Don't display both a comment and a pull request when a new
                // pull request is created.
                if (ue.payload.issue.created_at ==
                    ue.payload.comment.created_at) {
                        break;
                }
                displayed++;
                result[day].push('Commented on issue '+
                    issueLink(ue.payload.comment.html_url,
                              ue.payload.issue.number)+
                    '<br>'+repoLink(ue.repo.name));
                break;
            }
        });
        Object.keys(result).forEach(function(day) {
            if (result[day].length > 0) {
                html += '<div class="day">'+day+'</div>';
                html += '<ul class="content_list">';
                result[day].forEach(function(activity) {
                    html += '<li>'+activity+'</li>';
                });
                html += '</ul>';
            }
        });
        document.getElementById('github').style.display = 'none';
        document.getElementById('github').innerHTML = html;
        $('#github').fadeIn({duration: 800});
    });
}
