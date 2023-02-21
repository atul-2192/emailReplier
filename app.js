const express=require("express");
const app=express();

const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const gmail = google.gmail('v1');
const { v4: uuidv4 } = require('uuid');

// Set up OAuth2 client
const oauth2Client = new OAuth2(
  '27398089964-hkklu7uj2oqm5tlq7n1rk25op1lmp4g0.apps.googleusercontent.com',
  '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',
  '/'
);

// Set up authorization credentials
const credentials = {
  access_token: 'YOUR_ACCESS_TOKEN',
  refresh_token: 'YOUR_REFRESH_TOKEN',
  scope: 'https://www.googleapis.com/auth/gmail.modify',
  token_type: 'Bearer',
  expiry_date: 'EXPIRY_DATE'
};
oauth2Client.setCredentials(credentials);

// Function to check for new emails
async function checkNewEmails() {
  try {
    // Get list of threads in inbox
    const inboxRes = await gmail.users.threads.list({
      auth: oauth2Client,
      userId: 'me',
      q: 'in:inbox',
      maxResults: 100,
    });

    // Filter threads that have no prior replies from you
    const filteredThreads = inboxRes.data.threads.filter(thread => {
      const labels = thread.messages[0].labelIds;
      return !labels.includes('SENT') && !labels.includes('INBOX');
    });

    // Send replies to filtered threads
    filteredThreads.forEach(async thread => {
      const threadId = thread.id;
      const message = thread.messages[0];
      const from = message.payload.headers.find(header => header.name === 'From').value;
      const subject = message.payload.headers.find(header => header.name === 'Subject').value;
      const messageId = message.id;
      const email = createEmail(from, subject);
      
      await sendEmail(oauth2Client, email);
      
      // Add label to email and move to label
      const labelId = await addLabel(oauth2Client, 'My Label');
      await addLabelToEmail(oauth2Client, threadId, labelId);
      await removeLabelFromEmail(oauth2Client, threadId, 'INBOX');
    });
  } catch (error) {
    console.log(error);
  }
}

// Function to create email reply
function createEmail(to, subject) {
  const email = `To: ${to}\n`;
  email += `Subject: Re: ${subject}\n\n`;
  email += `Thank you for your email. I am currently out of the office and will respond to your message upon my return.\n\n`;
  email += `Best regards,\n`;
  email += `Your Name`;
  return email;
}

// Function to send email
async function sendEmail(auth, email) {
  try {
    const res = await gmail.users.messages.send({
      auth: auth,
      userId: 'me',
      resource: {
        raw: Buffer.from(email).toString('base64')
      }
    });
    console.log(`Message sent to ${res.data.to}`);
  } catch (error) {
    console.log(error);
  }
}

// Function to add label to Gmail
async function addLabel(auth, labelName) {
  try {
    const res = await gmail.users.labels.create({
      auth: auth,
      userId: 'me',
      resource: {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
        color: {
          backgroundColor: '#ffffff',
          textColor: '#000000'
        }
      }
    });
    return res.data.id;
  } catch (error) {
    console.log(error);
  }
}

// Function to add label to email


app.get('/',(req,res)=>{
    res.send("welcome to the home page");
})

app.listen(3000,(err)=>{
    if(err) console.log(err);
    console.log("Server is running");
});
