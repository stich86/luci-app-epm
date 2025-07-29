/* eSIM Profile Manager - Main JavaScript
Developed by: Giammarco M. <stich86@gmail.com>
Version: 1.0.0
*/

var lastInactiveTime = {};

function showTab(tabId, tabLink) {
    var tabContents = document.querySelectorAll('.cbi-tabcontent');
    for (var i = 0; i < tabContents.length; i++) {
        if(tabContents[i].classList.contains('cbi-tabcontent-active')) {
            lastInactiveTime[tabContents[i].id] = new Date().getTime();
        }
        tabContents[i].classList.remove('cbi-tabcontent-active');
    }
    
    var tabLinks = document.querySelectorAll('.cbi-tab');
    for (var i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove('cbi-tab-active');
    }
    
    var targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('cbi-tabcontent-active');
    }
    
    if (tabLink && tabLink.parentNode) {
        tabLink.parentNode.classList.add('cbi-tab-active');
    }

    var now = new Date().getTime();
    var shouldReload = false;

    // Refresh tab after 30s of inactivity
    if (!lastInactiveTime[tabId] || (now - lastInactiveTime[tabId] > 30000)) {
        shouldReload = true;
    }

    if (shouldReload) {
        if (tabId === 'info-tab' && typeof loadESIMInfo === 'function') {
            setTimeout(loadESIMInfo, 100);
        } else if (tabId === 'profiles-tab' && typeof loadProfiles === 'function') {
            setTimeout(loadProfiles, 100);
        } else if (tabId === 'notifications-tab' && typeof loadNotifications === 'function') {
            setTimeout(loadNotifications, 100);
        } else if (tabId === 'config-tab' && typeof loadConfig === 'function') {
            setTimeout(loadConfig, 100);
        }
    }

    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    var firstTab = document.querySelector('.cbi-tab a');
    if (firstTab) {
        firstTab.parentNode.classList.add('cbi-tab-active');

        if (typeof loadESIMInfo === 'function') {
            setTimeout(function() {
                loadESIMInfo();
            }, 2000);
        }
    }
});