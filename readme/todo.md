## Todo

# Delete Confirmation Modal - Common
- [ ] Apply to all delete confirmations under /dashboard routes

# Types and constant in /route/page.tsx should go into components

# Hide Values option
- [X] on the /dashboard route
- [ ] ensure all routes have it

# Overview main page
- [ ] Ensure that investment and property routes have a chart like /savings route. Ensure that all values are represented on the main route /dashboard, by using the data provider and it should load all values with history from the database. 

# Real Estate
- it uses the value of the property, I want to use the current equity of the property

# Security
- [ ] When adding Debt it should immeditaely show in the main page (by using a spinner or skeleton loader)  /dashboard with the message instead of Well done, no debt to in red the amount of debt and deduct from total net assets as it is a liability

/dashboard/assets route and /dashboard route, the cards still show the the property value, redo them and use the current equity value. Ensure that the total is also calculated properly 

# Security
- I want MFA
 
# Overview main page
- the bar of the cards should be purple instead from white to green 

# Loading component
- add the pension modal, we have a beautiful loading component for it, make that a common component

# Middleware
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
