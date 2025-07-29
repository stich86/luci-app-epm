/* eSIM Manager - Profiles Tab JavaScript 
Developed by: Giammarco M. <stich86@gmail.com>
Version: 1.0.0
*/

// Global variable to track if reboot is needed
var needsReboot = false;
var rebootReason = '';

// ===== REBOOT BANNER FUNCTIONS =====

function checkServerRebootStatus() {
    // Check server-side if there are profiles that were recently enabled
    // but modem hasn't been rebooted since
    var xhr = new XMLHttpRequest();
    xhr.open('GET', L.url('admin', 'modem', 'epm', 'reboot_status'), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var data = JSON.parse(xhr.responseText);
                if (data.success && data.reboot_needed) {
                    needsReboot = true;
                    rebootReason = data.reason || _('Profile changes require a modem restart to take effect.');
                    
                    // Show banner
                    showRebootBanner(rebootReason);
                } else {
                    // No reboot needed, hide banner if it exists
                    hideRebootBanner();
                }
            } catch (e) {
                // Ignore JSON parse errors
                console.warn('Failed to parse reboot status response');
            }
        }
    };
    xhr.send();
}

function createRebootBanner() {
    // Check if banner already exists
    var existingBanner = document.getElementById('reboot-reminder-banner');
    if (existingBanner) {
        return; // Banner already present
    }
    
    // Find profiles container
    var profilesContent = document.getElementById('profiles-content');
    if (!profilesContent) {
        return;
    }
    
    // Create banner
    var banner = document.createElement('div');
    banner.id = 'reboot-reminder-banner';
    banner.className = 'reboot-reminder-banner';
    banner.style.cssText = 'background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 15px 20px; margin-bottom: 20px; border-radius: 8px; border: none; box-shadow: 0 4px 12px rgba(255,107,107,0.3); font-size: 14px; display: none; position: relative; overflow: hidden;';
    
    // Add background pattern
    banner.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px); pointer-events: none;"></div>
        <div style="position: relative; z-index: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px;">
                    <div style="font-size: 24px; animation: pulse 2s infinite;">⚠️</div>
                    <div>
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${_('Modem Restart Required')}</div>
                        <div style="font-size: 13px; opacity: 0.9;">${_('Change eSIM profile requires a modem restart to take effect.')}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; flex-shrink: 0;">
                    <button type="button" onclick="rebootModem()" class="banner-reboot-btn" style="background: white; color: #ee5a52; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${_('Restart Now')}</button>
                    <button type="button" onclick="dismissRebootBanner(); return false;" class="banner-dismiss-btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s ease;">${_('Later')}</button>
                </div>
            </div>
        </div>
    `;
    
    // Add hover styles dynamically
    var style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .banner-reboot-btn:hover {
            background: #f8f9fa !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
        }
        .banner-dismiss-btn:hover {
            background: rgba(255,255,255,0.3) !important;
            border-color: rgba(255,255,255,0.6) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Insert banner at the beginning of profiles content
    var firstChild = profilesContent.firstChild;
    profilesContent.insertBefore(banner, firstChild);
}

function showRebootBanner(reason) {
    needsReboot = true;
    rebootReason = reason || _('Change eSIM profile requires a modem restart to take effect.');
    
    // Create banner if it doesn't exist
    createRebootBanner();
    
    // Show banner
    var banner = document.getElementById('reboot-reminder-banner');
    if (banner) {
        banner.style.display = 'block';
        
        // Update reason text
        var reasonText = document.getElementById('reboot-reason-text');
        if (reasonText) {
            reasonText.textContent = rebootReason;
        }
        
        // Entry animation
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-20px)';
        banner.style.transition = 'all 0.3s ease';
        
        setTimeout(function() {
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        }, 10);
    }
}

function hideRebootBanner() {
    needsReboot = false;
    rebootReason = '';
    
    var banner = document.getElementById('reboot-reminder-banner');
    if (banner) {
        banner.style.transition = 'all 0.3s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-20px)';
        
        setTimeout(function() {
            banner.style.display = 'none';
        }, 300);
    }
}

function dismissRebootBanner() {
    // Temporarily hide banner but reboot state remains on server
    var banner = document.getElementById('reboot-reminder-banner');
    if (banner) {
        banner.style.transition = 'all 0.3s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-20px)';
        
        setTimeout(function() {
            banner.style.display = 'none';
        }, 300);
        
        // Show reminder message
        setTimeout(function() {
            var toast = document.createElement('div');
            toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ffc107; color: #212529; padding: 12px 20px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; font-weight: bold; font-size: 14px;';
            toast.textContent = _('The reminder will reappear when you reload the page until you restart the modem.');
            document.body.appendChild(toast);
            
            setTimeout(function() {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 5000);
        }, 500);
    }
}

// ===== eSIM DELETE BANNER FUNCTIONS + NOTIFICATIONS PROCESS =====

function showEsimDeleteNotificationBanner() {
    // Check if banner already exists
    //var existingBanner = document.getElementById('esim-delete-notification-banner');
    //if (existingBanner) {
    //    return; // Banner already shown
    //}
    
    // Find profiles container
    var profilesContent = document.getElementById('profiles-content');
    if (!profilesContent) {
        return;
    }

    // Create banner
    var banner = document.createElement('div');
    banner.id = 'esim-delete-notification-banner';
    banner.className = 'esim-delete-notification-banner';
    banner.style.cssText = 'background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 15px 20px; margin-bottom: 20px; border-radius: 8px; border: none; box-shadow: 0 4px 12px rgba(255,107,107,0.3); font-size: 14px; display: none; position: relative; overflow: hidden;';
    
    // Add background pattern
    banner.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px); pointer-events: none;"></div>
        <div style="position: relative; z-index: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px;">
                    <div style="font-size: 24px; animation: pulse 2s infinite;">⚠️</div>
                    <div>
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${_('eSIM Delete Notification Required')}</div>
                        <div style="font-size: 13px; opacity: 0.9;">${_('To properly release the deleted eSIM, delete notifications must be processed as soon as possible.\r\nWarning: if you do not process the notification but delete it, the eSIM will no longer be reusable.\r\nDo you want to process them now?')}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; flex-shrink: 0;">
                    <button type="button" id="esim-process-btn" onclick="processAllNotificationsFromProfile();" class="banner-proceed-btn" style="background: white; color: #ee5a52; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${_('Process Now')}</button>
                    <button type="button" onclick="hideEsimDeleteNotificationBanner(); return false;" class="banner-dismiss-btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s ease;">${_('Later')}</button>
                </div>
            </div>
        </div>
    `;
    
    // Add hover styles dynamically
    var style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }            
        .banner-proceed-btn:hover {
            background: #f8f9fa !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
        }
        .banner-dismiss-btn:hover {
            background: rgba(255,255,255,0.3) !important;
            border-color: rgba(255,255,255,0.6) !important;
        }
        .processing-spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid #ee5a52;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }            
    `;
    document.head.appendChild(style);
    
    // Insert banner at the beginning of profiles content
    var firstChild = profilesContent.firstChild;
    profilesContent.insertBefore(banner, firstChild);

    setTimeout(function() {
        banner.style.display = 'block';
    }, 100);
}

function hideEsimDeleteNotificationBanner() {
    var banner = document.getElementById('esim-delete-notification-banner');
    if (banner) {
        banner.parentNode.removeChild(banner);
    }
}

function processAllNotificationsFromProfile() {
    var xhr = new XMLHttpRequest();
    var processBtn = document.getElementById('esim-process-btn');
    
    if (processBtn) {
        processBtn.innerHTML = '<span class="processing-spinner"></span>' + _('Processing...');
        processBtn.disabled = true;
    }

    xhr.open('POST', L.url('admin', 'modem', 'epm', 'notification_process_all'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {          
            if (xhr.status === 200) {
                try {
                var data = JSON.parse(xhr.responseText);
                
                if (data.type === 'lpa' && data.payload) {
                        if (data.payload.code === 0) {
                            var successMessage = data.payload.message || 'Notification process completed successfully';
                            document.getElementById('profile-notifications-success-message').textContent = successMessage;
                            document.getElementById('profile-notifications-success').style.display = 'block';
                        
                            setTimeout(function() {
                                loadProfiles();
                                document.getElementById('profile-notifications-success').style.display = 'none';
                                document.getElementById('esim-delete-notification-banner').style.display = 'none';
                            }, 2000);
                        } else {
                            var errorMessage = '';
                            if (data.payload.message) {
                                errorMessage = data.payload.message;
                            }
                            if (data.payload.data) {
                                errorMessage += (errorMessage ? ' - ' : '') + data.payload.data;
                            }
                            if (data.payload.code !== undefined) {
                                errorMessage += ' (code: ' + data.payload.code + ')';
                            }
                            if (!errorMessage) {
                                errorMessage = 'Unknown error occurred';
                            }                                            

                            document.getElementById('profile-notifications-error-message').textContent = errorMessage;
                            document.getElementById('profile-notifications-error').style.display = 'block';
                        }
                    } else if (data.type === 'error' && data.payload) {
                        var errorMessage = '';
                        if (data.payload.message) {
                            errorMessage = data.payload.message;
                        }
                        if (data.payload.data) {
                            errorMessage += (errorMessage ? ' - ' : '') + data.payload.data;
                        }
                        if (!errorMessage) {
                            errorMessage = 'Server error occurred';
                        }
                        
                        document.getElementById('profile-notifications-error-message').textContent = errorMessage;
                        document.getElementById('profile-notifications-error').style.display = 'block';
                    } else {
                        document.getElementById('profile-notifications-error-message').textContent = 'Unexpected response format';
                        document.getElementById('profile-notifications-error').style.display = 'block';
                    }                        

                } catch (e) {
                    document.getElementById('profile-notifications-error-message').textContent = 'Invalid response format';
                    document.getElementById('profile-notifications-error').style.display = 'block';
                    console.error('JSON parsing error:', e);
                }
            } else {
                document.getElementById('profile-notifications-error-message').textContent = 'Failed to download profile (HTTP ' + xhr.status + ')';
                document.getElementById('profile-notifications-error').style.display = 'block';
            }
        }
    };                
    xhr.send();
}

// ===== PROFILE FUNCTIONS =====

function loadProfiles() {
    document.getElementById('profiles-loading').style.display = 'block';
    document.getElementById('profiles-content').style.display = 'none';
    document.getElementById('profiles-error').style.display = 'none';
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', L.url('admin', 'modem', 'epm', 'profiles'), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            document.getElementById('profiles-loading').style.display = 'none';
            
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    displayProfiles(data.profiles);
                    document.getElementById('profiles-content').style.display = 'block';
                    // Check server for reboot state and update banner
                    checkServerRebootStatus();
                } else {
                    document.getElementById('profiles-error-message').textContent = data.error || 'Unknown error';
                    document.getElementById('profiles-error').style.display = 'block';
                }
            } else {
                document.getElementById('profiles-error-message').textContent = 'Failed to load profiles';
                document.getElementById('profiles-error').style.display = 'block';
            }
        }
    };
    xhr.send();
}

function displayProfiles(profiles) {
    var tbody = document.getElementById('profiles-tbody');
    tbody.innerHTML = '';
    
    window.currentProfilesData = profiles;
    
    if (!profiles || profiles.length === 0) {
        document.getElementById('no-profiles').style.display = 'block';
        return;
    }
    
    document.getElementById('no-profiles').style.display = 'none';
    
    profiles.forEach(function(profile) {
        var row = document.createElement('tr');
        row.className = 'cbi-section-table-row';
        
        var nameCell = document.createElement('td');
        nameCell.className = 'cbi-section-table-cell';
        
        var displayName = '';
        if (profile.profileNickname && profile.profileNickname.trim() !== '') {
            displayName = profile.profileNickname;
        } else if (profile.profileName && profile.profileName.trim() !== '') {
            displayName = profile.profileName;
        } else if (profile.serviceProviderName && profile.serviceProviderName.trim() !== '') {
            displayName = profile.serviceProviderName;
        } else {
            displayName = 'Unknown';
        }
        
        nameCell.textContent = displayName;
        row.appendChild(nameCell);
        
        var iccidCell = document.createElement('td');
        iccidCell.className = 'cbi-section-table-cell';
        iccidCell.textContent = profile.iccid || '-';
        iccidCell.style.fontFamily = 'monospace';
        row.appendChild(iccidCell);
        
        var providerCell = document.createElement('td');
        providerCell.className = 'cbi-section-table-cell';
        providerCell.textContent = profile.serviceProviderName || '-';
        row.appendChild(providerCell);
        
        var statusCell = document.createElement('td');
        statusCell.className = 'cbi-section-table-cell';
        statusCell.style.textAlign = 'center';
        var statusText = profile.profileState || 'unknown';
        var statusLabel = '';
        var statusClass = '';
        
        // Translate and standardize states
        switch(statusText.toLowerCase()) {
            case 'enabled':
                statusLabel = _('ENABLED');
                statusClass = 'enabled';
                break;
            case 'disabled':
                statusLabel = _('DISABLED');
                statusClass = 'disabled';
                break;
            default:
                statusLabel = _('UNKNOWN');
                statusClass = 'unknown';
        }
        
        statusCell.innerHTML = '<span class="profile-status profile-status-' + statusClass + '">' + statusLabel + '</span>';
        row.appendChild(statusCell);
        
        var actionsCell = document.createElement('td');
        actionsCell.className = 'cbi-section-table-cell';
        actionsCell.style.textAlign = 'center';
        
        if (profile.iccid) {
            var isEnabled = profile.profileState === 'enabled';
            var toggleText = isEnabled ? _('Disable') : _('Enable');
            var toggleAction = isEnabled ? 'disable' : 'enable';
            
            // Create action dropdown container
            var actionContainer = document.createElement('div');
            actionContainer.className = 'action-dropdown';
            
            // Toggle button (primary action)
            var toggleButton = document.createElement('input');
            toggleButton.type = 'button';
            toggleButton.className = 'cbi-button profile-action-btn primary-action';
            toggleButton.value = toggleText;
            toggleButton.onclick = function() { toggleProfile(profile.iccid, toggleAction, displayName); };
            
            // Dropdown button
            var dropdownButton = document.createElement('button');
            dropdownButton.type = 'button';
            dropdownButton.className = 'cbi-button profile-action-btn dropdown-toggle';
            dropdownButton.innerHTML = '▼';
            dropdownButton.onclick = function(e) { toggleDropdown(e, profile.iccid); };
            
            // Dropdown menu
            var dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'dropdown-menu';
            dropdownMenu.id = 'dropdown-' + profile.iccid;
            
            // Change Name option
            var changeNameItem = document.createElement('div');
            changeNameItem.className = 'dropdown-item';
            changeNameItem.innerHTML = '<i class="icon-edit"></i> ' + _('Change Nickname');
            changeNameItem.onclick = function() { showChangeNameDialog(profile.iccid, ''); };
            
            // Delete option
            var deleteItem = document.createElement('div');
            deleteItem.className = 'dropdown-item danger';
            deleteItem.innerHTML = '<i class="icon-trash"></i> ' + _('Delete Profile');
            
            // Use display name for deletion confirmation
            var confirmName = displayName;
            deleteItem.onclick = function() { confirmDeleteProfile(profile.iccid, confirmName); };
            
            dropdownMenu.appendChild(changeNameItem);
            dropdownMenu.appendChild(deleteItem);
            
            actionContainer.appendChild(toggleButton);
            actionContainer.appendChild(dropdownButton);
            actionContainer.appendChild(dropdownMenu);
            
            actionsCell.appendChild(actionContainer);
        }
        
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

function toggleProfile(iccid, action, profileName) {
    var button = event.target;
    var originalText = button.value;
    
    // If we're enabling a profile, show reboot warning
    if (action === 'enable') {
        var confirmMessage = _('Are you sure you want to enable the profile "%s"?\n\nIMPORTANT: After enabling the profile, you will need to restart the modem for the changes to take effect. The profile will not be active until the modem is restarted.').replace('%s', profileName);
        
        if (!confirm(confirmMessage)) {
            return; // User cancelled
        }
    }
    
    button.value = _('Working...');
    button.disabled = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'toggle'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            button.disabled = false;
            
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    // If enable was successful, show reboot dialog with options
                    if (action === 'enable') {
                        showRebootDialog(profileName);
                    }
                    // Reload profiles list to update status
                    loadProfiles();
                } else {
                    button.value = originalText;
                    alert('Error: ' + (data.error || 'Unknown error'));
                }
            } else {
                button.value = originalText;
                alert('Failed to toggle profile');
            }
        }
    };
    xhr.send('iccid=' + encodeURIComponent(iccid) + '&action=' + encodeURIComponent(action));
}

function toggleDropdown(event, iccid) {
    event.stopPropagation();
    
    var allDropdowns = document.querySelectorAll('.dropdown-menu');
    allDropdowns.forEach(function(dropdown) {
        if (dropdown.id !== 'dropdown-' + iccid) {
            dropdown.classList.remove('show');
        }
    });
    
    var dropdown = document.getElementById('dropdown-' + iccid);
    dropdown.classList.toggle('show');
}

function showChangeNameDialog(iccid, currentName) {
    var currentProfile = null;
    var profiles = window.currentProfilesData || [];
    for (var i = 0; i < profiles.length; i++) {
        if (profiles[i].iccid === iccid) {
            currentProfile = profiles[i];
            break;
        }
    }
    
    var currentDisplayName = '';
    if (currentProfile) {
        if (currentProfile.profileNickname && currentProfile.profileNickname.trim() !== '') {
            currentDisplayName = currentProfile.profileNickname;
        } else if (currentProfile.profileName && currentProfile.profileName.trim() !== '') {
            currentDisplayName = currentProfile.profileName;
        } else if (currentProfile.serviceProviderName && currentProfile.serviceProviderName.trim() !== '') {
            currentDisplayName = currentProfile.serviceProviderName;
        }
    }
    
    var newName = prompt(_('Enter new profile nickname') + ':', currentDisplayName);
    if (newName !== null && newName.trim() !== '') {
        changeProfileName(iccid, newName.trim());
    }
}

function changeProfileName(iccid, newName) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'nickname'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    // Reload profiles list to update name
                    loadProfiles();
                } else {
                    alert('Error: ' + (data.error || 'Unknown error'));
                }
            } else {
                alert('Failed to change profile name');
            }
        }
    };
    xhr.send('iccid=' + encodeURIComponent(iccid) + '&nickname=' + encodeURIComponent(newName));
}

function confirmDeleteProfile(iccid, profileName) {
    if (confirm(_('Are you sure you want to delete the profile "%s"? This action cannot be undone.').replace('%s', profileName))) {
        deleteProfile(iccid);
    }
}

function deleteProfile(iccid) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'delete'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    // Reload profiles list
                    loadProfiles();
                    showEsimDeleteNotificationBanner();
                } else {
                    alert('Error: ' + (data.error || 'Unknown error'));
                }
            } else {
                alert('Failed to delete profile');
            }
        }
    };
    xhr.send('iccid=' + encodeURIComponent(iccid));
}

// ===== REBOOT FUNCTIONS =====

function showRebootDialog(profileName) {
    var message = _('Profile "%s" has been enabled successfully!\n\nTo activate the profile, you need to restart the modem. Would you like to restart the modem now?').replace('%s', profileName);
    
    if (confirm(message)) {
        // User wants to reboot now
        rebootModem();
    } else {
        // User chose not to reboot now - banner will appear automatically
        // since the server-side flag was already set by the toggle operation
        alert(_('A reminder banner will appear and persist until you restart the modem.'));
        
        // Refresh to show the banner immediately
        setTimeout(function() {
            checkServerRebootStatus();
        }, 500);
    }
}

function rebootModem() {
    // Show final confirmation message
    var finalConfirm = _('The modem will be restarted now. This operation will take about few minutes and you will lose the connection temporarily.\n\nContinue with the restart?');
    
    if (!confirm(finalConfirm)) {
        return;
    }
    
    // Hide reboot banner since we're rebooting
    hideRebootBanner();
    
    // Show status message
    var rebootMessage = document.createElement('div');
    rebootMessage.id = 'reboot-status';
    rebootMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; background: #fff; border: 2px solid #007bff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; text-align: center; min-width: 300px;';
    rebootMessage.innerHTML = '<h3 style="margin-top: 0; color: #007bff;">' + _('Restarting Modem') + '</h3>' +
                             '<p>' + _('The modem is being restarted. Please wait...') + '</p>' +
                             '<div style="margin: 15px 0;"><img src="/luci-static/resources/icons/loading.gif" alt="Loading" /></div>' +
                             '<p style="font-size: 12px; color: #666;">' + _('This page will reload automatically when the modem is ready.') + '</p>';
    
    document.body.appendChild(rebootMessage);
    
    // Execute reboot
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'reboot_modem'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    // Reboot started successfully
                    startRebootCountdown();
                } else {
                    // Error during reboot
                    document.body.removeChild(rebootMessage);
                    alert('Error during restart: ' + (data.error || 'Unknown error'));
                }
            } else {
                // Network error during reboot
                document.body.removeChild(rebootMessage);
                alert('Failed to restart modem. Please try manually from System → Reboot.');
            }
        }
    };
    xhr.send();
}

function startRebootCountdown() {
    var countdown = 30; 
    var rebootStatus = document.getElementById('reboot-status');
    
    if (!rebootStatus) return;
    
    var interval = setInterval(function() {
        countdown--;
        
        var countdownText = rebootStatus.querySelector('p');
        if (countdownText) {
            countdownText.textContent = _('Modem is restarting... Time remaining: %d seconds').replace('%d', countdown);
        }
        
        if (countdown <= 0) {
            clearInterval(interval);
            // Try to reload profile
	    loadProfiles();
        }
    }, 1000);
    
    // Try to check if system is back online before countdown
    setTimeout(function() {
        checkSystemOnline(interval);
    }, 15000); // Start checking after 15 seconds
}

function checkSystemOnline(countdownInterval) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', L.url('admin', 'modem', 'epm', 'status'), true);
    xhr.timeout = 5000; // 5 seconds timeout
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // System back online
            clearInterval(countdownInterval);
            
            var rebootStatus = document.getElementById('reboot-status');
            if (rebootStatus) {
                rebootStatus.innerHTML = '<h3 style="margin-top: 0; color: #28a745;">' + _('Restart Complete') + '</h3>' +
                                       '<p>' + _('The modem has been restarted successfully. Reloading page...') + '</p>';
                
                setTimeout(function() {
		    // Remove reboot status dialog first
                    if (document.body.contains(rebootStatus)) {
                        document.body.removeChild(rebootStatus);
                    }
                    loadProfiles();
                }, 2000);
            }
        }
    };
    
    xhr.ontimeout = function() {
        // System still not online, retry in 5 seconds
        setTimeout(function() {
            checkSystemOnline(countdownInterval);
        }, 5000);
    };
    
    xhr.onerror = function() {
        // System still not online, retry in 5 seconds
        setTimeout(function() {
            checkSystemOnline(countdownInterval);
        }, 5000);
    };
    
    xhr.send();
}

document.addEventListener('click', function() {
    var allDropdowns = document.querySelectorAll('.dropdown-menu');
    allDropdowns.forEach(function(dropdown) {
        dropdown.classList.remove('show');
    });
});