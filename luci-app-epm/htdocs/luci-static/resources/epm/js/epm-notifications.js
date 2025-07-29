/* eSIM Manager - Notifications Tab JavaScript
Developed by: Giammarco M. <stich86@gmail.com>
Version: 1.0.0
*/

var notificationsData = [];
var profilesLookup = {};

var SHOW_LOGS = false;

function fetchEnableLogsConfig(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', L.url('admin', 'modem', 'epm', 'config'), true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      if (data.success && data.config) {
        SHOW_LOGS = (data.config.epm.json_output == 1 || data.config.epm.json_output === "1");
        if (callback) callback(SHOW_LOGS);
      }
    }
  };
  xhr.send();
}

// ===== NOTIFICATIONS FUNCTIONS =====

function loadNotifications() {
    document.getElementById('notifications-loading').style.display = 'block';
    document.getElementById('notifications-content').style.display = 'none';
    document.getElementById('notifications-error').style.display = 'none';
    
    loadProfilesForLookup(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', L.url('admin', 'modem', 'epm', 'notifications'), true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                document.getElementById('notifications-loading').style.display = 'none';
                
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        notificationsData = data.notifications;
                        displayNotifications(data.notifications);
                        document.getElementById('notifications-content').style.display = 'block';
                    } else {
                        document.getElementById('notifications-error-message').textContent = data.error || 'Unknown error';
                        document.getElementById('notifications-error').style.display = 'block';
                    }
                } else {
                    document.getElementById('notifications-error-message').textContent = 'Failed to load notifications';
                    document.getElementById('notifications-error').style.display = 'block';
                }
            }
        };
        xhr.send();
    });
}

function loadProfilesForLookup(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', L.url('admin', 'modem', 'epm', 'profiles'), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success && data.profiles) {
                    // Create lookup table ICCID -> Provider
                    profilesLookup = {};
                    data.profiles.forEach(function(profile) {
                        if (profile.iccid) {
                            profilesLookup[profile.iccid] = profile.serviceProviderName || 'Unknown Provider';
                        }
                    });
                }
            }
            callback();
        }
    };
    xhr.send();
}

function displayNotifications(notifications) {
    var tbody = document.getElementById('notifications-tbody');
    tbody.innerHTML = '';

    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
        document.getElementById('no-notifications').style.display = 'block';
        return;
    }
    
    document.getElementById('no-notifications').style.display = 'none';
    
    notifications.forEach(function(notification) {
        var row = document.createElement('tr');
        row.className = 'cbi-section-table-row';
        
        // Sequence Number
        var seqCell = document.createElement('td');
        seqCell.className = 'cbi-section-table-cell';
        seqCell.style.fontWeight = 'bold';
        seqCell.textContent = notification.seqNumber || '-';
        row.appendChild(seqCell);
        
        // ICCID
        var iccidCell = document.createElement('td');
        iccidCell.className = 'cbi-section-table-cell';
        iccidCell.textContent = notification.iccid || '-';
        iccidCell.style.fontFamily = 'monospace';
        iccidCell.style.fontSize = '12px';
        row.appendChild(iccidCell);
        
        // Provider (lookup from profiles)
        var providerCell = document.createElement('td');
        providerCell.className = 'cbi-section-table-cell';
        var provider = profilesLookup[notification.iccid] || 'Unknown';
        providerCell.textContent = provider;
        row.appendChild(providerCell);
        
        // Operation
        var operationCell = document.createElement('td');
        operationCell.className = 'cbi-section-table-cell';
        var operation = notification.profileManagementOperation || 'unknown';
        var operationBadge = createOperationBadge(operation);
        operationCell.appendChild(operationBadge);
        row.appendChild(operationCell);
        
        // Actions
        var actionsCell = document.createElement('td');
        actionsCell.className = 'cbi-section-table-cell';
        actionsCell.style.textAlign = 'center';
        
        if (notification.seqNumber) {
            // Process button
            var processBtn = document.createElement('input');
            processBtn.type = 'button';
            processBtn.className = 'cbi-button notification-action-btn process-btn';
            processBtn.value = _('Process');
            processBtn.onclick = function() { processNotification(notification.seqNumber); };
            
            // Remove button
            var removeBtn = document.createElement('input');
            removeBtn.type = 'button';
            removeBtn.className = 'cbi-button notification-action-btn remove-btn';
            removeBtn.value = _('Remove');
            removeBtn.onclick = function() { removeNotification(notification.seqNumber); };
            
            actionsCell.appendChild(processBtn);
            actionsCell.appendChild(document.createTextNode(' '));
            actionsCell.appendChild(removeBtn);
        }
        
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

function createOperationBadge(operation) {
    var badge = document.createElement('span');
    badge.className = 'operation-badge';
    
    switch(operation.toLowerCase()) {
        case 'install':
            badge.className += ' operation-install';
            badge.textContent = _('INSTALL');
            break;
        case 'enable':
            badge.className += ' operation-enable';
            badge.textContent = _('ENABLE');
            break;
        case 'disable':
            badge.className += ' operation-disable';
            badge.textContent = _('DISABLE');
            break;
        case 'delete':
            badge.className += ' operation-delete';
            badge.textContent = _('DELETE');
            break;
        default:
            badge.className += ' operation-unknown';
            badge.textContent = operation.toUpperCase();
    }
    
    return badge;
}

function processNotification(seqNumber) {
    var btn = event.target;
    var originalText = btn.value;
    btn.value = _('Processing...');
    btn.disabled = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'notification_process'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            btn.disabled = false;
            btn.value = originalText;
            
            if (xhr.status === 200) {
                try {
                var data = JSON.parse(xhr.responseText);
                
                if (data.type === 'lpa' && data.payload) {
                        if (data.payload.code === 0) {
                            var successMessage = data.payload.message || 'Notification process completed successfully';
                            document.getElementById('notifications-success-message').textContent = successMessage;
                            document.getElementById('notifications-success').style.display = 'block';
                        
                            if (SHOW_LOGS && data) {
                               showNotificationLogs('Notification #' + seqNumber, data);
                            }

                            setTimeout(function() {
                                if (typeof loadNotifications === 'function') {
                                    loadNotifications();
                                    document.getElementById('notifications-success').style.display = 'none';
                                }
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

                            document.getElementById('notifications-error-message').textContent = errorMessage;
                            document.getElementById('notifications-error').style.display = 'block';
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
                        
                        document.getElementById('notifications-error-message').textContent = errorMessage;
                        document.getElementById('notifications-error').style.display = 'block';
                    } else {
                        document.getElementById('notifications-error-message').textContent = 'Unexpected response format';
                        document.getElementById('notifications-error').style.display = 'block';
                    }                        

                } catch (e) {
                    document.getElementById('download-error-message').textContent = 'Invalid response format';
                    document.getElementById('download-error').style.display = 'block';
                    console.error('JSON parsing error:', e);
                }
            } else {
                document.getElementById('download-error-message').textContent = 'Failed to download profile (HTTP ' + xhr.status + ')';
                document.getElementById('download-error').style.display = 'block';
            }
        }
    };
    xhr.send('seqNumber=' + encodeURIComponent(seqNumber));
}

function removeNotification(seqNumber) {
    
    var btn = event.target;
    var originalText = btn.value;
    btn.value = _('Removing...');
    btn.disabled = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'notification_remove'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            btn.disabled = false;
            btn.value = originalText;
            
            if (xhr.status === 200) {
                try {
                var data = JSON.parse(xhr.responseText);
                
                if (data.type === 'lpa' && data.payload) {
                        if (data.payload.code === 0) {
                            var successMessage = data.payload.message || 'Notification process completed successfully';
                            document.getElementById('notifications-success-message').textContent = successMessage;
                            document.getElementById('notifications-success').style.display = 'block';
                        
                            if (SHOW_LOGS && data) {
                               showNotificationLogs('Notification #' + seqNumber, data);
                            }

                            setTimeout(function() {
                                if (typeof loadNotifications === 'function') {
                                    loadNotifications();
                                    document.getElementById('notifications-success').style.display = 'none';
                                }
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

                            document.getElementById('notifications-error-message').textContent = errorMessage;
                            document.getElementById('notifications-error').style.display = 'block';
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
                        
                        document.getElementById('notifications-error-message').textContent = errorMessage;
                        document.getElementById('notifications-error').style.display = 'block';
                    } else {
                        document.getElementById('notifications-error-message').textContent = 'Unexpected response format';
                        document.getElementById('notifications-error').style.display = 'block';
                    }                        

                } catch (e) {
                    document.getElementById('download-error-message').textContent = 'Invalid response format';
                    document.getElementById('download-error').style.display = 'block';
                    console.error('JSON parsing error:', e);
                }
            } else {
                document.getElementById('download-error-message').textContent = 'Failed to download profile (HTTP ' + xhr.status + ')';
                document.getElementById('download-error').style.display = 'block';
            }
        }
    };
    xhr.send('seqNumber=' + encodeURIComponent(seqNumber));
}

function processAllNotifications() {
    if (!notificationsData || notificationsData.length === 0) {
        alert(_('No notifications to process'));
        return;
    }
    
    if (!confirm(_('Are you sure you want to process all notifications?'))) {
        return;
    }
    
    var btn = event.target;
    var originalText = btn.value;
    btn.value = _('Processing...');
    btn.disabled = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'notification_process_all'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            btn.disabled = false;
            btn.value = originalText;
            
            if (xhr.status === 200) {
                try {
                var data = JSON.parse(xhr.responseText);
                
                if (data.type === 'lpa' && data.payload) {
                        if (data.payload.code === 0) {
                            var successMessage = data.payload.message || 'Notification process completed successfully';
                            document.getElementById('notifications-success-message').textContent = successMessage;
                            document.getElementById('notifications-success').style.display = 'block';
                        
                            if (SHOW_LOGS && data) {
                               showNotificationLogs('Process All Notifications' , data);
                            }

                            setTimeout(function() {
                                if (typeof loadNotifications === 'function') {
                                    loadNotifications();
                                    document.getElementById('notifications-success').style.display = 'none';
                                }
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

                            document.getElementById('notifications-error-message').textContent = errorMessage;
                            document.getElementById('notifications-error').style.display = 'block';
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
                        
                        document.getElementById('notifications-error-message').textContent = errorMessage;
                        document.getElementById('notifications-error').style.display = 'block';
                    } else {
                        document.getElementById('notifications-error-message').textContent = 'Unexpected response format';
                        document.getElementById('notifications-error').style.display = 'block';
                    }                        

                } catch (e) {
                    document.getElementById('download-error-message').textContent = 'Invalid response format';
                    document.getElementById('download-error').style.display = 'block';
                    console.error('JSON parsing error:', e);
                }
            } else {
                document.getElementById('download-error-message').textContent = 'Failed to download profile (HTTP ' + xhr.status + ')';
                document.getElementById('download-error').style.display = 'block';
            }
        }
    };                
    xhr.send();
}

function processAllNotificationsAndRemove() {
    if (!notificationsData || notificationsData.length === 0) {
        alert(_('No notifications to process'));
        return;
    }
    
    if (!confirm(_('Are you sure you want to process all notifications and remove them?'))) {
        return;
    }
    
    var btn = event.target;
    var originalText = btn.value;
    btn.value = _('Processing...');
    btn.disabled = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'notification_process_and_remove_all'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            btn.disabled = false;
            btn.value = originalText;
            
            if (xhr.status === 200) {
                try {
                var data = JSON.parse(xhr.responseText);
                
                if (data.type === 'lpa' && data.payload) {
                        if (data.payload.code === 0) {
                            var successMessage = data.payload.message || 'Notification process completed successfully';
                            document.getElementById('notifications-success-message').textContent = successMessage;
                            document.getElementById('notifications-success').style.display = 'block';
                        
                            if (SHOW_LOGS && data) {
                               showNotificationLogs('Process All Notifications' , data);
                            }

                            setTimeout(function() {
                                if (typeof loadNotifications === 'function') {
                                    loadNotifications();
                                    document.getElementById('notifications-success').style.display = 'none';
                                }
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

                            document.getElementById('notifications-error-message').textContent = errorMessage;
                            document.getElementById('notifications-error').style.display = 'block';
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
                        
                        document.getElementById('notifications-error-message').textContent = errorMessage;
                        document.getElementById('notifications-error').style.display = 'block';
                    } else {
                        document.getElementById('notifications-error-message').textContent = 'Unexpected response format';
                        document.getElementById('notifications-error').style.display = 'block';
                    }                        

                } catch (e) {
                    document.getElementById('download-error-message').textContent = 'Invalid response format';
                    document.getElementById('download-error').style.display = 'block';
                    console.error('JSON parsing error:', e);
                }
            } else {
                document.getElementById('download-error-message').textContent = 'Failed to download profile (HTTP ' + xhr.status + ')';
                document.getElementById('download-error').style.display = 'block';
            }
        }
    };                
    xhr.send();
}

function removeAllNotifications() {
    if (!notificationsData || notificationsData.length === 0) {
        alert(_('No notifications to remove'));
        return;
    }
    
    if (!confirm(_('Are you sure you want to remove all notifications? This action cannot be undone.'))) {
        return;
    }
    
    var btn = event.target;
    var originalText = btn.value;
    btn.value = _('Removing...');
    btn.disabled = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'notification_remove_all'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            btn.disabled = false;
            btn.value = originalText;
            
            if (xhr.status === 200) {
                try {
                var data = JSON.parse(xhr.responseText);
                
                if (data.type === 'lpa' && data.payload) {
                        if (data.payload.code === 0) {
                            var successMessage = data.payload.message || 'Notification process completed successfully';
                            document.getElementById('notifications-success-message').textContent = successMessage;
                            document.getElementById('notifications-success').style.display = 'block';
                        
                            if (SHOW_LOGS && data) {
                               showNotificationLogs('Process All Notifications' , data);
                            }

                            setTimeout(function() {
                                if (typeof loadNotifications === 'function') {
                                    loadNotifications();
                                    document.getElementById('notifications-success').style.display = 'none';
                                }
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

                            document.getElementById('notifications-error-message').textContent = errorMessage;
                            document.getElementById('notifications-error').style.display = 'block';
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
                        
                        document.getElementById('notifications-error-message').textContent = errorMessage;
                        document.getElementById('notifications-error').style.display = 'block';
                    } else {
                        document.getElementById('notifications-error-message').textContent = 'Unexpected response format';
                        document.getElementById('notifications-error').style.display = 'block';
                    }                        

                } catch (e) {
                    document.getElementById('download-error-message').textContent = 'Invalid response format';
                    document.getElementById('download-error').style.display = 'block';
                    console.error('JSON parsing error:', e);
                }
            } else {
                document.getElementById('download-error-message').textContent = 'Failed to download profile (HTTP ' + xhr.status + ')';
                document.getElementById('download-error').style.display = 'block';
            }
        }
    };
    xhr.send();
}

function showNotificationLogs(operation, dataObject) {
    var logsSection = document.getElementById('notifications-logs-section');
    var logsContent = document.getElementById('notifications-logs-content');
    
    if (!logsSection || !logsContent) {
        return;
    }
    
    // Show logs section
    logsSection.style.display = 'block';
    
    // Create timestamp
    var timestamp = new Date().toLocaleTimeString();
    var isSuccess = operation.indexOf('Error') === -1;
    var isError = operation.indexOf('Error') !== -1;
    
    var headerColor = isSuccess ? '#28a745' : '#dc3545';
    
    // Create div for the operation
    var headerDiv = document.createElement('div');
    headerDiv.style.color = headerColor;
    headerDiv.style.fontWeight = 'bold';
    headerDiv.style.marginBottom = '5px';
    headerDiv.style.paddingBottom = '5px';
    headerDiv.textContent = '[' + timestamp + '] ' + operation;
    
    // Create div for JSON output
    var contentDiv = document.createElement('div');
    contentDiv.style.marginBottom = '15px';
    contentDiv.style.padding = '5px';
    contentDiv.style.backgroundColor = '#ffffff';
    contentDiv.style.borderRadius = '3px';
    contentDiv.style.wordBreak = 'break-all';
    contentDiv.style.overflowWrap = 'break-word';
    
    // Format the data object
    var formattedOutput = '';
    try {
        if (typeof dataObject === 'string') {
            var lines = dataObject.split('\n');
            lines.forEach(function(line) {
                if (line.trim().startsWith('{')) {
                    var jsonObj = JSON.parse(line);
                    var jsonStr = JSON.stringify(jsonObj, function(key, value) {
                        if (typeof value === 'string' && value.length > 100) {
                            return value.substring(0, 100) + '...[truncated]';
                        }
                        return value;
                    }, 2);
                    formattedOutput += jsonStr + '\n\n';
                } else if (line.trim() !== '') {
                    formattedOutput += line + '\n';
                }
            });
        } else if (typeof dataObject === 'object' && dataObject !== null) {
            formattedOutput = JSON.stringify(dataObject, function(key, value) {
                if (typeof value === 'string' && value.length > 100) {
                    return value.substring(0, 100) + '...[truncated]';
                }
                return value;
            }, 2);
        } else {
            formattedOutput = String(dataObject);
        }
    } catch (e) {
        formattedOutput = String(dataObject);
        if (formattedOutput.length > 500) {
            formattedOutput = formattedOutput.substring(0, 500) + '...[truncated]';
        }
    }
    
    contentDiv.textContent = formattedOutput;
    
    logsContent.appendChild(headerDiv);
    logsContent.appendChild(contentDiv);

    logsContent.scrollTop = logsContent.scrollHeight;
}

function clearNotificationLogs() {
    var logsContent = document.getElementById('notifications-logs-content');
    logsContent.innerHTML = '';
    document.getElementById('notifications-logs-section').style.display = 'none';
}

function createNotificationLogsSection() {
    var notificationsError = document.getElementById('notifications-error');
    if (!notificationsError) {
        return;
    }
    
    var logsSection = document.createElement('div');
    logsSection.id = 'notifications-logs-section';
    logsSection.style.marginTop = '30px';
    logsSection.style.display = 'none';
    
    var fieldset = document.createElement('fieldset');
    fieldset.className = 'cbi-section';
    
    var legend = document.createElement('legend');
    legend.textContent = _('Output Logs');
    fieldset.appendChild(legend);
    
    var sectionNode = document.createElement('div');
    sectionNode.className = 'cbi-section-node';
    
    var logsContent = document.createElement('div');
    logsContent.id = 'notifications-logs-content';
    logsContent.style.cssText = 'background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; max-height: 300px; overflow-y: auto; overflow-x: hidden; width: calc(100% - 22px); max-width: 100%;';
    
    var buttonDiv = document.createElement('div');
    buttonDiv.style.marginTop = '10px';
    buttonDiv.style.textAlign = 'right';
    
    var clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'cbi-button cbi-button-reset';
    clearButton.textContent = _('Clear Logs');
    clearButton.onclick = clearNotificationLogs;
    
    buttonDiv.appendChild(clearButton);
    sectionNode.appendChild(logsContent);
    sectionNode.appendChild(buttonDiv);
    fieldset.appendChild(sectionNode);
    logsSection.appendChild(fieldset);
    
    notificationsError.parentNode.insertBefore(logsSection, notificationsError.nextSibling);
}

// Load logs config
fetchEnableLogsConfig(function(enableLogs) {
});