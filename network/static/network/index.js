document.addEventListener('DOMContentLoaded', function() {

    // Add an event listener on all like buttons that calls the function to AJAX update the likes
    var like_btns = document.getElementsByClassName("like_btn");
    for (var i=0; i<like_btns.length; i++) {
        like_btns[i].addEventListener('click', like_clicked);
    }

    // Add an event listener on all edit links
    var edit_links = document.getElementsByClassName("edit_link");
    for (var i=0; i<edit_links.length; i++) {
        edit_links[i].addEventListener('click', edit_clicked);
    }
});

// Function that Ajax updates the likes
function like_clicked() {

        // Get the Post Id
        const postid = this.dataset.postid;
        const like = this.dataset.like == '1';
        const likecaption = document.getElementById(`likecounter_id_${postid}`);

        // Push it to the API
        fetch('/like', {
            method: 'POST',
            body: JSON.stringify({
                postid: postid,
                like: like
                })
        })
        // Update the post with the new like count returned from the api
        .then(response => {
            if (response.ok) {
                response.json()
                .then(result => {
                    likecaption.innerHTML = `Likes: ${result.likecount}`;
                    if (like) {
                        this.dataset.like = '0';
                        this.innerHTML = "Unlike";
                    }
                    else {
                        this.dataset.like = '1';
                        this.innerHTML = "Like";
                    }
                })
                .catch(error => {
                    alert(error);
                });
            }
            else {
                alert(response.error);
            }
        })
        .catch(error => {
            alert(error);
        });
    
}


// Function that handles the edits
function edit_clicked(e) {
    e.preventDefault();
    this.style.visibility='collapse';
    const postid = this.dataset.postid;
    const postdiv = document.getElementById(`posttext_id_${postid}`);
    const editpost = document.createElement('textarea');
    const button = document.createElement('button');
    button.dataset.postid = postid,
    button.addEventListener('click', save_clicked);
    editpost.id = `textarea_id_${postid}`;
    
    editpost.value = postdiv.innerHTML.trim();
    postdiv.innerHTML='';
    button.innerHTML='Save';
    button.classList.add("btn-primary");
    postdiv.appendChild(editpost);
    postdiv.appendChild(button);


}

// Function that saves the edits
function save_clicked() {
    const postid = this.dataset.postid;
    const postdiv = document.getElementById(`posttext_id_${postid}`);
    const text = document.getElementById(`textarea_id_${postid}`);


    // Push it to the API
    fetch('/edit', {
        method: 'POST',
        body: JSON.stringify({
            postid: postid,
            text: text.value
            })
    })
    // Update the post text if everything is ok
    .then(response => {
        if (response.ok) {
            document.getElementById(`editref_id_${postid}`).style.visibility='visible';
            postdiv.innerHTML = text.value;
        }
        else {
            alert(response.error);
        }
    })
    .catch(error => {
        alert(error);
    });
}