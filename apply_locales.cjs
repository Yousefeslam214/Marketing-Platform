
const fs = require('fs');
const path = require('path');

const enPath = '/media/yousef/work1/CODE/octopus replit/DocuChatAI/client/src/locales/en.json';
const arPath = '/media/yousef/work1/CODE/octopus replit/DocuChatAI/client/src/locales/ar.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

// 1. Add adDetail to EN
en.adDetail = {
    "title": "Ad Details",
    "description": "View and manage ad details",
    "backToAds": "Back to Ads",
    "creditAssignedSuccess": "Credit assigned successfully",
    "failedToAssignCredit": "Failed to assign credit",
    "pleaseRetryLater": "Please retry later",
    "failedToActivateAd": "Failed to activate ad",
    "adActivatedSuccess": "Ad activated successfully",
    "campaignActiveMessage": "Your campaign is now active",
    "insufficientCreditsMessage": "Insufficient credits",
    "adDeactivatedSuccess": "Ad deactivated successfully",
    "campaignDeactivatedMessage": "Your campaign is now inactive",
    "promoteSuccess": "Ad Promoted",
    "promoteSuccessDescription": "Ad promoted successfully",
    "failedToPromoteAd": "Failed to promote ad",
    "alreadyDepromoted": "Already depromoted",
    "failedToDepromoteAd": "Failed to depromote ad",
    "depromoteSuccess": "Ad Depromoted",
    "depromoteSuccessDescription": "Ad depromoted successfully",
    "invalidCreditAmount": "Invalid credit amount",
    "enterValidCredit": "Please enter a valid credit amount",
    "failedToLoadMetrics": "Failed to load metrics",
    "viewUserDetails": "View User Details",
    "purchaseImpressions": "Purchase Impressions",
    "performanceOverview": "Performance Overview",
    "impressionsCredit": "Impressions Credit",
    "amountSpent": "Amount Spent",
    "likesCount": "Likes Count",
    "status": "Status",
    "active": "Active",
    "inactive": "Inactive",
    "Promote Status": "Promote Status",
    "campaignManagement": "Campaign Management",
    "assignCredits": "Assign Credits",
    "assigning": "Assigning...",
    "assignCredit": "Assign Credit"
};

// 2. Add missing keys to AR
if (!ar.ads.uploadPhoto.guidelines) ar.ads.uploadPhoto.guidelines = {};
ar.ads.uploadPhoto.guidelines.max1mb = "لا تقم بتحميل صور أكبر من 1 ميجابايت";
ar.ads.uploadPhoto.currentFileSize = "حجم الملف الحالي: {size} ميجابايت";
ar.ads.uploadPhoto.fileSelected = "تم اختيار الملف";

if (!ar.analytics) ar.analytics = {};
ar.analytics.description = "تحليلات تفصيلية لحملاتك";
ar.analytics.campaigns = "الحملات";
ar.analytics.demographics = "التركيبة السكانية";

if (!ar.pending) ar.pending = {};
ar.pending.pendingApprovals = "الموافقات المعلقة";
ar.pending.review = "مراجعة";

if (!ar.queue) ar.queue = {};
ar.queue.marketingQueue = "قائمة انتظار التسويق";
ar.queue.scheduled = "مجدول";
ar.queue.completed = "مكتمل";

if (!ar.AllAds) ar.AllAds = {};
ar.AllAds.marketingQueue = "قائمة انتظار التسويق";
ar.AllAds.scheduled = "مجدول";
ar.AllAds.processing = "قيد المعالجة";
ar.AllAds.completed = "مكتمل";

if (!ar.contact) ar.contact = {};
ar.contact.arabic = "العربية";


// 3. Add missing keys to EN
en.dashboard.conversionRate = "Conversion Rate";
en.dashboard.totalSpent = "Total Spent";
en.dashboard.activeAds = "Active Ads";
en.dashboard.pendingAds = "Pending Ads";
en.dashboard.rejectedAds = "Rejected Ads";
en.dashboard.adPerformance = "Ad Performance";
en.dashboard.campaignOverview = "Campaign Overview";
en.dashboard.quickActions = "Quick Actions";

en.payment.success.gotoads = "Go to Ads";
en.ads.uploadPhotoButton = "Upload Photo";

if (!en.uploadPhoto) en.uploadPhoto = {};
Object.assign(en.uploadPhoto, {
    "Upload a Photo": "Upload a Photo",
    "Ensure your photo is less than 1MB in size": "Ensure your photo is less than 1MB in size",
    "Please upload a photo for your ad": "Please upload a photo for your ad",
    "Upload Ad Photo": "Upload Ad Photo",
    "Please upload a photo for your ad.": "Please upload a photo for your ad.",
    "Upload Photo": "Upload Photo",
    "Good Lighting": "Good Lighting",
    "Avoid Text": "Avoid Text",
    "Relate to Your Audience": "Relate to Your Audience",
    "Photo Guidelines": "Photo Guidelines",
    "Choose Photo": "Choose Photo",
    "Continue": "Continue",
    "Skip for Now": "Skip for Now",
    "Skip": "Skip"
});

en.analytics.audience = "Audience";
en.analytics.conversions = "Conversions";
en.analytics.revenue = "Revenue";
en.analytics.costs = "Costs";
en.analytics.trends = "Trends";
en.analytics.comparison = "Comparison";
en.analytics.reports = "Reports";
en.analytics.export = "Export";
en.analytics.dateRange = "Date Range";
en.analytics.filter = "Filter";
en.analytics.metrics = "Metrics";
en.analytics.dimensions = "Dimensions";

en.pending.view = "View";
en.pending.details = "Details";
en.pending.submittedAt = "Submitted At";
en.pending.submittedBy = "Submitted By";
en.pending.priority = "Priority";
en.pending.category = "Category";

en.queue.position = "Position";
en.queue.estimatedTime = "Estimated Time";
en.queue.status = "Status";
en.queue.waiting = "Waiting";
en.queue.priority = "Priority";
en.queue.high = "High";
en.queue.medium = "Medium";
en.queue.low = "Low";

if (!en.AllAds) en.AllAds = {};
en.AllAds.filters = "Filters";
en.AllAds.search = "Search";
en.AllAds.sortBy = "Sort By";
en.AllAds.filterBy = "Filter By";
en.AllAds.showAll = "Show All";
en.AllAds.showActive = "Show Active";
en.AllAds.showInactive = "Show Inactive";
en.AllAds.bulkActions = "Bulk Actions";
en.AllAds.selectAll = "Select All";
en.AllAds.export = "Export";
en.AllAds.import = "Import";

if (!en.error) en.error = {};
en.error.title = "Error";
en.error.message = "An error occurred";
en.error.retry = "Retry";
en.error.home = "Home";

if (!en.contact) en.contact = {};
en.contact.english = "English";

// Write back
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));

console.log("Locales updated successfully.");
