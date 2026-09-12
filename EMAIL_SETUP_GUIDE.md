# Email Configuration Guide

Your backend now sends real emails for password resets! Follow these steps to set it up.

## Quick Setup (Gmail)

### Step 1: Generate Gmail App Password

1. Go to https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Scroll to **App passwords** (you may need to enable 2-step verification first)
4. Select **Mail** and **Windows Computer** (or your device)
5. Google will generate a 16-character password
6. Copy this password

### Step 2: Update .env file

Edit `backend/.env` and replace:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-password-here
EMAIL_FROM=Buganda Heritage <noreply@buganda-heritage.com>
```

**Example:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Buganda Heritage <john.doe@gmail.com>
```

### Step 3: Restart Backend

```bash
cd backend
npm start
```

You should see:
```
✓ Email service connected successfully
```

### Step 4: Test Password Reset

1. Go to Forgot Password page
2. Enter your email
3. Check your inbox for the reset code
4. Enter code and new password
5. Check inbox for confirmation email

## Alternative Email Services

### Option 1: Mailtrap (Free Testing)
1. Sign up at https://mailtrap.io
2. Get SMTP credentials from dashboard
3. Update .env:
```env
EMAIL_SERVICE=smtp.mailtrap.io
EMAIL_USER=your-mailtrap-user
EMAIL_PASSWORD=your-mailtrap-password
```

### Option 2: SendGrid
1. Create free account at https://sendgrid.com
2. Generate API key
3. Update .env:
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Option 3: Outlook/Office365
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## Email Templates

The system sends two types of emails:

### 1. Password Reset Code
- Subject: Password Reset - Buganda Heritage Archives
- Contains: 6-digit reset code (valid for 15 minutes)
- Styling: Heritage theme with gold/brown colors

### 2. Password Reset Confirmation
- Subject: Password Reset Successful - Buganda Heritage Archives
- Contains: Confirmation message + login link
- Styling: Same heritage theme

## Security Notes

1. **Never commit .env to git** - Keep credentials private
2. **Gmail App Passwords** - More secure than storing your main password
3. **Email validation** - Codes expire after 15 minutes
4. **No email reveals** - System doesn't tell users if email exists (prevents user enumeration)

## Troubleshooting

### "Email configuration error"
- Check .env credentials are correct
- For Gmail: Ensure 2-step verification is enabled
- For Gmail: App password is at least 16 characters

### Emails not arriving
- Check spam folder
- Verify email address is correct
- Check backend console for error messages

### Error: "nodemailer not found"
Run in backend folder:
```bash
npm install nodemailer
```

## Testing Without Email Service

If you want to skip email setup temporarily, emails will be logged to the console:

Backend console will show:
```
⚠️  Email configuration error: ...
   Password reset emails will not be sent until configured.
```

Users will still see "verification code sent" message, but no actual email is sent.

## Production Deployment

For production on services like Vercel, Netlify, Render:

1. Set environment variables through provider's dashboard
2. Use service-specific SMTP settings if available
3. Consider using SendGrid/Mailgun for better deliverability
4. Monitor email bounce rates and adjust accordingly

## Support

If emails still don't work:
1. Check backend logs for errors
2. Verify .env file format (no extra spaces)
3. Test credentials directly with Nodemailer test
4. Check email service's rate limits
