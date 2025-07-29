/* eSIM Profile Manager - Connectivity Check - Shared Module
Developed by: Giammarco M. <stich86@gmail.com>
Version: 1.0.0
*/

var eSIMConnectivity = (function() {
    var isConnected = false;
    
    function checkConnectivity() {
        var checkingEl = document.getElementById('connectivity-checking');
        var onlineEl = document.getElementById('connectivity-online');
        var offlineEl = document.getElementById('connectivity-offline');
        
        if (!checkingEl || !onlineEl || !offlineEl) {
            console.log('Connectivity banner elements not found, trying again in 100ms...');
            setTimeout(checkConnectivity, 100);
            return;
        }
        
        checkingEl.style.display = 'block';
        onlineEl.style.display = 'none';
        offlineEl.style.display = 'none';
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', L.url('admin', 'modem', 'epm', 'connectivity'), true);
        xhr.timeout = 10000;
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                checkingEl.style.display = 'none';
                
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (data.success) {
                            isConnected = data.connected;
                            if (data.connected) {
                                onlineEl.style.display = 'block';
                            } else {
                                offlineEl.style.display = 'block';
                            }
                        } else {
                            showOffline();
                        }
                    } catch (e) {
                        showOffline();
                    }
                } else {
                    showOffline();
                }
            }
        };
        
        xhr.ontimeout = function() {
            checkingEl.style.display = 'none';
            showOffline();
        };
        
        xhr.onerror = function() {
            checkingEl.style.display = 'none';
            showOffline();
        };
        
        xhr.send();
    }
    
    function showOffline() {
        isConnected = false;
        var offlineEl = document.getElementById('connectivity-offline');
        if (offlineEl) {
            offlineEl.style.display = 'block';
        }
    }
    
    function forceCheck() {
        isConnected = false;
        var checkingEl = document.getElementById('connectivity-checking');
        var onlineEl = document.getElementById('connectivity-online');
        var offlineEl = document.getElementById('connectivity-offline');
        
        if (checkingEl && onlineEl && offlineEl) {
            checkingEl.style.display = 'block';
            onlineEl.style.display = 'none';
            offlineEl.style.display = 'none';
            setTimeout(checkConnectivity, 50);
        } else {
            setTimeout(forceCheck, 100);
        }
    }
    
    function getConnectionStatus() {
        return isConnected;
    }
    
    function promptIfOffline(message) {
        if (!isConnected) {
            if (confirm(message || _('No internet connection detected. Do you want to check connectivity again before proceeding?'))) {
                forceCheck();
                return false;
            }
        }
        return true;
    }
    
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', forceCheck);
        } else {
            forceCheck();
        }
    }
    
    return {
        check: checkConnectivity,
        forceCheck: forceCheck,
        isConnected: getConnectionStatus,
        promptIfOffline: promptIfOffline,
        init: init
    };
})();

function checkConnectivity() {
    eSIMConnectivity.forceCheck();
}

eSIMConnectivity.init();