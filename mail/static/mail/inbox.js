document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#email-reply').addEventListener('click', reply_email);
    document.querySelector('#email-archive').addEventListener('click', archive_email);
    
    // If email is send call the function that pushes the email info to the API
    document.querySelector('#compose-form').onsubmit = () => {
        return send_email();
    }

    // By default, load the inbox
    load_mailbox('inbox');

});
  
function compose_email() {
  
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    
    // Clear error message   
    document.querySelector('#compose-message').innerHTML = '';
}

function send_email() {
    
    // Get the Email infos from the DOM
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    
    // Clear out error message
    const messageTag = document.querySelector('#compose-message');
    messageTag.innerHTML = '';
    
    // Push it to the API
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body,
            })
    })
    .then(response => {
        if (response.ok) {
            load_mailbox('sent'); 
        }
        else {
            response.json()
            .then(result => {
                  messageTag.innerHTML = result.error;
            })
            .catch(error => {
                messageTag.innerHTML = error;
            });
        }  
    })
    .catch(error => {
        messageTag.innerHTML = error;
    });
    return false;    
}
  
function load_mailbox(mailbox) {
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-header').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Empty the body
    const body = document.querySelector('#emails-body')
    body.innerHTML ='';

    // Query the api
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);

        // Create a div for each email, assign it its properties and onclick event
        for (i=0; i<emails.length; i++) {
            const emailDiv = document.createElement('div');
            body.appendChild(emailDiv);
            emailDiv.onclick = show_email;
            emailDiv.classList.add("mailInMailbox");
            if (emails[i].read === true) {
                emailDiv.classList.add("mailInMailboxRed");
            }
            
            emailDiv.dataset.emailId = emails[i].id;
        
            emailDiv.innerHTML = `<b>${emails[i].sender}: </b> ${emails[i].subject}  <span style="float:right">${emails[i].timestamp}</span>`;
           
        }
    
    })
    .catch(error => {
        body.innerHTML = error;
    });
}

function show_email() {
    
    // Show the mail and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    const emailDiv = document.querySelector('#email-view').style.display = 'block';
    
    const emailId = this.dataset.emailId;

    // Get and empty the fields
    const from = document.querySelector('#email-from');
    const to = document.querySelector('#email-to');
    const timestamp = document.querySelector('#email-timestamp');
    const subject = document.querySelector('#email-subject');
    const body = document.querySelector('#email-body');
    const archive = document.querySelector('#email-archive');

    from.innerHTML = '';
    to.innerHTML = '';
    timestamp.innerHTML = '';
    subject.innerHTML = '';
    body.innerHTML = '';

    // Query the api for the email, display it and mark it as read if everything is successfull
    fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log(email);
        from.innerHTML = email.sender;
        to.innerHTML = email.recipients;
        timestamp.innerHTML = email.timestamp;
        subject.innerHTML = email.subject;
        body.innerHTML = email.body;
        archive.dataset.emailId = emailId;
        
        // Set archive properties
        if (email.archived) {
            archive.innerHTML = 'Move to Inbox';
            archive.dataset.archived = 'false';
        }
        else {
            archive.innerHTML = 'Move to Archive';
            archive.dataset.archived = 'true';
        }

        // Mark the email as read
        fetch(`/emails/${emailId}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
        })
        .catch(error => {
            body.innerHTML = error;
        });
    
    })
    .catch(error => {
        body.innerHTML = error;
    });
}

function reply_email() {
    
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Prefill the fields
    document.querySelector('#compose-recipients').value = document.querySelector('#email-from').innerHTML;
    document.querySelector('#compose-subject').value = `Re: ${document.querySelector('#email-subject').innerHTML}`;
    document.querySelector('#compose-body').value = `\n\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nOn ${document.querySelector('#email-timestamp').innerHTML} ${document.querySelector('#email-from').innerHTML} wrote:\n\n${document.querySelector('#email-body').innerHTML}`;

    // Clear error message   
    document.querySelector('#compose-message').innerHTML = '';
}

function archive_email() {

    fetch(`/emails/${this.dataset.emailId}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: (this.dataset.archived === 'true')
        })
    })
    .then(response => {
        load_mailbox('inbox');
    })
    .catch(error => {
    });
    
}

