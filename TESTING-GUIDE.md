# 🧪 Testing Guide - HAS Status Report

## Quick Testing URLs

### 🧪 **Testing Mode (Interactive)**
```
https://your-site.com/status-report?test=true
```
- **What it does:** Shows an interactive testing dashboard
- **Features:** Switch between client/employee views, see previews, quick test links

### 👤 **Client View Testing**
```
https://your-site.com/status-report?client=st-marys
https://your-site.com/status-report?client=metro-health
https://your-site.com/status-report?client=community-care
https://your-site.com/status-report?client=demo
```

### 👥 **Employee View Testing**
```
https://your-site.com/status-report?admin=true
```

## 🎭 Testing Scenarios

### **Scenario 1: Client Access**
1. **URL:** `?client=st-marys`
2. **What you should see:**
   - St. Mary's branding (red theme)
   - Only St. Mary's data
   - "Admin Dashboard" button in top right
   - No access to other clients

### **Scenario 2: Employee Access**
1. **URL:** `?admin=true`
2. **What you should see:**
   - Dashboard with all client cards
   - Each client has their own color/logo
   - Click any client to view their report
   - "Add New Client" and "Copy All URLs" buttons

### **Scenario 3: Interactive Testing**
1. **URL:** `?test=true`
2. **What you should see:**
   - Orange testing header
   - Role switcher buttons
   - Live preview of both views
   - Quick test links

## 🔍 What to Test

### **Client View Tests:**
- [ ] Correct hospital name and branding
- [ ] Only shows that client's data
- [ ] Can't access other clients
- [ ] Admin dashboard button works
- [ ] All functionality (add tasks, edit, etc.) works

### **Employee View Tests:**
- [ ] Shows all clients in dashboard
- [ ] Each client has unique branding
- [ ] Clicking client cards navigates correctly
- [ ] Add new client button works
- [ ] Copy URLs button works

### **Data Separation Tests:**
- [ ] Add a task in one client view
- [ ] Switch to another client view
- [ ] Verify the task only appears for the first client
- [ ] Verify data is completely separate

## 🚀 Quick Test Commands

### **Local Development:**
```bash
# Start the app
npm start

# Test URLs (open in browser):
# http://localhost:3000/?test=true
# http://localhost:3000/?client=st-marys
# http://localhost:3000/?admin=true
```

### **Production Testing:**
```bash
# Build the app
npm run build

# Deploy to your 365 environment
# Then test with your production URLs
```

## 🐛 Common Issues & Solutions

### **Issue: All clients show same data**
- **Solution:** Check that backend is filtering by `clientId`
- **Check:** Backend API calls include `?clientId=client-name`

### **Issue: Admin dashboard not showing**
- **Solution:** Verify URL has `?admin=true`
- **Check:** No other parameters interfering

### **Issue: Client branding not showing**
- **Solution:** Check `src/clientConfig.js` has correct client ID
- **Check:** URL parameter matches config file

### **Issue: Testing mode not working**
- **Solution:** Verify URL has `?test=true`
- **Check:** No JavaScript errors in browser console

## 📱 Mobile Testing

### **Test on Mobile Devices:**
- [ ] Client view works on mobile
- [ ] Employee dashboard is responsive
- [ ] Testing mode works on mobile
- [ ] All buttons are touch-friendly

## 🔒 Security Testing

### **Verify Data Isolation:**
1. Add data to Client A
2. Switch to Client B
3. Verify Client B doesn't see Client A's data
4. Switch back to Client A
5. Verify data is still there

### **Test URL Manipulation:**
1. Try accessing `?client=fake-client`
2. Should fall back to demo client
3. Try accessing `?admin=true` from client view
4. Should work (employees can access admin)

## 📊 Test Results Template

```
Test Date: _______________
Tester: _________________

✅ Client Views:
- [ ] Demo Hospital
- [ ] St. Mary's Medical Center  
- [ ] Metro Health System
- [ ] Community Care Hospital

✅ Employee Dashboard:
- [ ] Shows all clients
- [ ] Navigation works
- [ ] Add client works
- [ ] Copy URLs works

✅ Data Separation:
- [ ] Client A data isolated
- [ ] Client B data isolated
- [ ] No cross-contamination

✅ Mobile Responsive:
- [ ] Client view mobile
- [ ] Employee view mobile
- [ ] Testing mode mobile

Issues Found: ________________
Notes: _______________________
```

## 🎯 Testing Checklist

- [ ] **All client URLs work**
- [ ] **Admin dashboard accessible**
- [ ] **Testing mode functional**
- [ ] **Data properly separated**
- [ ] **Mobile responsive**
- [ ] **No JavaScript errors**
- [ ] **All features work in each view**
- [ ] **URLs can be shared/bookmarked** 