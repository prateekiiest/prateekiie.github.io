function formatTime(timestamp) {
    var ts = new Date(timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                  'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[ts.getMonth()]+' '+ts.getDate();
}

function repoLink(name) {
    return '<a class="repo" href="https://github.com/'+name+'">'+name+'</a>';
}

function branchLink(repo, branch) {
    return '<a class="branch" '+
           'href="https://github.com/'+repo+'/tree/'+branch+'">'+
            branch+'</a>';
}

function pullRequestLink(url, number) {
    return '<a class="pullreq" href="'+url+'">&#35;'+number+'</a>';
}

function githubActivity(user) {
    var gh = new Octokit({username:user});
    var user = gh.getUser(user);
    user.getEvents().done(function(events) {
        var max = 20;
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
                    pullRequestLink(ue.payload.pull_request.html_url,
                                    ue.payload.number)+
                    '<br>'+repoLink(ue.repo.name));
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
        document.getElementById('github').innerHTML = html;
    });
}
