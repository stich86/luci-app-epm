/* eSIM Profile Manager - Info Tab JavaScript
Developed by: Giammarco M. <stich86@gmail.com>
Version: 1.0.0
*/

function loadESIMInfo() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', L.url('admin', 'modem', 'epm', 'status'), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            document.getElementById('esim-info-error').style.display = 'none';
            document.getElementById('esim-info-content').style.display = 'none';
            document.getElementById('esim-info-loading').style.display = 'none';

            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    document.getElementById('esim-eid').textContent = data.eid || '-';
                    document.getElementById('esim-profile-version').textContent = data.info.profileVersion || '-';
                    document.getElementById('esim-svn').textContent = data.info.svn || '-';
                    document.getElementById('esim-firmware').textContent = data.info.euiccFirmwareVer || '-';
                    document.getElementById('esim-nv-memory').textContent = (data.info.extCardResource.freeNonVolatileMemory || 0) + ' bytes';
                    document.getElementById('esim-v-memory').textContent = (data.info.extCardResource.freeVolatileMemory || 0) + ' bytes';
                    document.getElementById('esim-apps').textContent = data.info.extCardResource.installedApplication || 0;

                    document.getElementById('esim-info-content').style.display = 'block';

                } else {
                    document.getElementById('esim-error-message').textContent = data.error || 'Unknown error';
                    document.getElementById('esim-info-error').style.display = 'block';
                }
            } else {
                document.getElementById('esim-error-message').textContent = 'Failed to load eSIM information';
                document.getElementById('esim-info-error').style.display = 'block';
            }
        }
    };
    xhr.send();
}