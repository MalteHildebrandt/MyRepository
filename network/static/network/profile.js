document.addEventListener('DOMContentLoaded', function() {

    // Add an event listener on follow / unfollow radiobuttons
    document.getElementById('follow').addEventListener('change', (event) => {
        follow_clicked(follow=true, event=event)
    });
    document.getElementById('nfollow').addEventListener('change', (event) => {
        follow_clicked(follow=false, event=event)
    });
});

function follow_clicked(follow, event) {
    const numfollowerstag = document.getElementById('numfollowers');
    const userid = event.srcElement.dataset.userid;
    var numfollowers = parseInt(numfollowerstag.innerHTML);
    
    if (follow) {
        numfollowers++;
    }
    else {
        numfollowers--;
    }
    // Push it to the API
    fetch('/follow', {
        method: 'POST',
        body: JSON.stringify({
            userid: userid,
            follow: follow
            })
    })
    // Update the post text if everything is ok
    .then(response => {
        if (response.ok) {
            numfollowerstag.innerHTML = numfollowers;
        }
        else {
            alert(response.error);
        }
    })
    .catch(error => {
        alert(error);
    });

}