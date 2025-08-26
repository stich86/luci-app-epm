/* eSIM Profile Manager - Configuration Tab JavaScript 
Developed by: Giammarco M. <stich86@gmail.com>
Version: 1.0.0
*/

var configLoaded = false;
function loadConfigIfNeeded() {
    if (!configLoaded) {
        configLoaded = true;
        loadConfig();
    }
}

var currentConfig = {};

function loadConfig() {
    document.getElementById('config-loading').style.display = 'block';
    document.getElementById('config-content').style.display = 'none';
    document.getElementById('config-error').style.display = 'none';
    document.getElementById('config-success').style.display = 'none';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', L.url('admin', 'modem', 'epm', 'config'), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            document.getElementById('config-loading').style.display = 'none';

            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    currentConfig = data.config;
                    populateForm(data.config);
                    document.getElementById('config-content').style.display = 'block';
                } else {
                    document.getElementById('config-error-message').textContent = data.error || 'Unknown error';
                    document.getElementById('config-error').style.display = 'block';
                }
            } else {
                document.getElementById('config-error-message').textContent = 'Failed to load configuration';
                document.getElementById('config-error').style.display = 'block';
            }
        }
    };
    xhr.send();
}

function populateForm(config) {
    // EPM settings - everything is now unified under config.epm
    if (config.epm) {
        // Global settings
        document.getElementById('apdu_backend').value = config.epm.apdu_backend || 'at';
        
        // Device settings
        document.getElementById('at_device').value = config.epm.at_device || '/dev/ttyUSB3';
        document.getElementById('qmi_device').value = config.epm.qmi_device || '/dev/cdc-wdm0';
        document.getElementById('qmi_sim_slot').value = config.epm.qmi_sim_slot || '1';
        document.getElementById('mbim_device').value = config.epm.mbim_device || '/dev/cdc-wdm0';
        document.getElementById('mbim_proxy').value = config.epm.mbim_proxy || '0';
        
        // Reboot settings
        document.getElementById('reboot_method').value = config.epm.reboot_method || 'at';
        document.getElementById('reboot_at_command').value = config.epm.reboot_at_command || 'AT+CFUN=1,1';
        document.getElementById('reboot_at_device').value = config.epm.reboot_at_device || config.epm.reboot_at_device || '/dev/ttyUSB3';
        document.getElementById('reboot_qmi_device').value = config.epm.reboot_qmi_device || config.epm.reboot_qmi_device || '/dev/cdc-wdm0';
        document.getElementById('reboot_qmi_slot').value = config.epm.reboot_qmi_slot || config.epm.qmi_sim_slot || '1';
        document.getElementById('reboot_mbim_device').value = config.epm.reboot_mbim_device || config.epm.reboot_mbim_device || '/dev/cdc-wdm0';
        document.getElementById('reboot_custom_command').value = config.epm.reboot_custom_command || 'echo "Custom reboot command here"';

        // Logs settings
        document.getElementById('json_output').value = config.epm.json_output || '0';

    } else {
        // Set default values if no configuration exists
        setDefaultValues();
    }

    // Update field visibility based on current selections
    onBackendChange();
    onRebootMethodChange();
}

function setDefaultValues() {
    // Global settings defaults
    document.getElementById('apdu_backend').value = 'at';
    
    // Device settings defaults
    document.getElementById('at_device').value = '/dev/ttyUSB3';
    document.getElementById('qmi_device').value = '/dev/cdc-wdm0';
    document.getElementById('qmi_sim_slot').value = '1';
    document.getElementById('mbim_device').value = '/dev/cdc-wdm0';
    document.getElementById('mbim_proxy').value = '0';
    
    // Reboot settings defaults
    document.getElementById('reboot_method').value = 'at';
    document.getElementById('reboot_at_command').value = 'AT+CFUN=1,1';
    document.getElementById('reboot_at_device').value = '/dev/ttyUSB3';
    document.getElementById('reboot_qmi_device').value = '/dev/cdc-wdm0';
    document.getElementById('reboot_qmi_slot').value = '1';
    document.getElementById('reboot_mbim_device').value = '/dev/cdc-wdm0';
    document.getElementById('reboot_custom_command').value = 'echo "Custom reboot command here"';

    // Logs settings
    document.getElementById('json_output').value = '0';
}

function onBackendChange() {
    const backend = document.getElementById('apdu_backend').value;
    
    // Hide all device settings
    document.getElementById('at-device-setting').style.display = 'none';
    document.getElementById('qmi-device-setting').style.display = 'none';
    document.getElementById('qmi-sim-slot-setting').style.display = 'none';
    document.getElementById('mbim-device-setting').style.display = 'none';
    document.getElementById('mbim-proxy-setting').style.display = 'none';
    
    // Show only relevant settings
    if (backend === 'at') {
        document.getElementById('at-device-setting').style.display = 'flex';
    } else if (backend === 'uqmi') {
        document.getElementById('qmi-device-setting').style.display = 'flex';
        document.getElementById('qmi-sim-slot-setting').style.display = 'flex';
    } else if (backend === 'mbim') {
        document.getElementById('mbim-device-setting').style.display = 'flex';
        document.getElementById('mbim-proxy-setting').style.display = 'flex';
    }
    
    // Update reboot method visibility
    onRebootMethodChange();
}

function onRebootMethodChange() {
    const method = document.getElementById('reboot_method').value;
    
    // Hide all reboot settings
    document.getElementById('at-reboot-setting').style.display = 'none';
    document.getElementById('at-reboot-port-setting').style.display = 'none';
    document.getElementById('qmi-reboot-setting').style.display = 'none';
    document.getElementById('qmi-reboot-slot-setting').style.display = 'none';
    document.getElementById('mbim-reboot-setting').style.display = 'none';
    document.getElementById('custom-reboot-setting').style.display = 'none';
    
    // Show only relevant settings
    if (method === 'at') {
        document.getElementById('at-reboot-setting').style.display = 'flex';
        document.getElementById('at-reboot-port-setting').style.display = 'flex'; 
    } else if (method === 'qmi') {
        document.getElementById('qmi-reboot-setting').style.display = 'flex';
        document.getElementById('qmi-reboot-slot-setting').style.display = 'flex';
    } else if (method === 'mbim') {
        document.getElementById('mbim-reboot-setting').style.display = 'flex';
    } else if (method === 'custom') {
        document.getElementById('custom-reboot-setting').style.display = 'flex';
    }
}

function saveConfig() {
    // Validate before saving
    if (!validateConfig()) {
        return;
    }
    
    document.getElementById('config-error').style.display = 'none';
    document.getElementById('config-success').style.display = 'none';

    // Read all form data and organize it in the unified EPM structure
    var config = {
        epm: {
            // Global settings
            apdu_backend: document.getElementById('apdu_backend').value,
            
            // Device settings
            at_device: document.getElementById('at_device').value,
            qmi_device: document.getElementById('qmi_device').value,
            qmi_sim_slot: document.getElementById('qmi_sim_slot').value,
            mbim_device: document.getElementById('mbim_device').value,
            mbim_proxy: document.getElementById('mbim_proxy').value,
            
            // Reboot settings
            reboot_method: document.getElementById('reboot_method').value,
            reboot_at_command: document.getElementById('reboot_at_command').value,
            reboot_at_device: document.getElementById('reboot_at_device').value,
            reboot_qmi_device: document.getElementById('reboot_qmi_device').value,
            reboot_qmi_slot: document.getElementById('reboot_qmi_slot').value,
            reboot_mbim_device: document.getElementById('reboot_mbim_device').value,
            reboot_custom_command: document.getElementById('reboot_custom_command').value,

            // Logs settings
            json_output: document.getElementById('json_output').value

        }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', L.url('admin', 'modem', 'epm', 'saveconfig'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    document.getElementById('config-success-message').textContent = data.message || 'Configuration saved successfully';
                    document.getElementById('config-success').style.display = 'block';
                    currentConfig = config;
                } else {
                    document.getElementById('config-error-message').textContent = data.error || 'Unknown error';
                    document.getElementById('config-error').style.display = 'block';
                }
            } else {
                document.getElementById('config-error-message').textContent = 'Failed to save configuration';
                document.getElementById('config-error').style.display = 'block';
            }
        }
    };
    xhr.send('config=' + encodeURIComponent(JSON.stringify(config)));
}

// Utility functions for validation
function validateDevicePath(path) {
    return path && path.startsWith('/dev/');
}

function validateSimSlot(slot) {
    const slotNum = parseInt(slot);
    return !isNaN(slotNum) && slotNum >= 1 && slotNum <= 2;
}

function validateConfig() {
    var backend = document.getElementById('apdu_backend').value;
    
    // Validate device path based on selected backend
    if (backend === 'at') {
        var atDevice = document.getElementById('at_device').value;
        if (!validateDevicePath(atDevice)) {
            alert('AT device path must start with /dev/');
            return false;
        }
    } else if (backend === 'uqmi') {
        var qmiDevice = document.getElementById('qmi_device').value;
        if (!validateDevicePath(qmiDevice)) {
            alert('QMI device path must start with /dev/');
            return false;
        }
        
        var qmiSlot = document.getElementById('qmi_sim_slot').value;
        if (!validateSimSlot(qmiSlot)) {
            alert('QMI SIM slot must be 1 or 2');
            return false;
        }
    } else if (backend === 'mbim') {
        var mbimDevice = document.getElementById('mbim_device').value;
        if (!validateDevicePath(mbimDevice)) {
            alert('MBIM device path must start with /dev/');
            return false;
        }
    }
    
    return true;
}