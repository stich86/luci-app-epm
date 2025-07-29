## 📋 **Tested Modules and eSIMs**

The following table shows modules on which the application has been tested:

# Modem Compatibility Table

<table>
    <thead>
        <tr>
            <th rowspan="2">Modem Tested</th>
            <th colspan="2">e-SIM</th>
            <th colspan="3">APDU backend</th>
            <th rowspan="2">Firmware<br>ATI Output</th>
            <th rowspan="2">Reboot Method</th>
        </tr>
            <tr>
                <th>Internal</th>
                <th>External</th>
                <th>AT</th>
                <th>MBIM</th>
                <th>QMI</th>
        </tr>
    </thead>
    <tbody>
            <tr>
                <td class="modem-name">Foxconn T99W175 (MV31-W)</td>
                <td class="status-ok">✓</td>
                <td class="status-ok">✓</td>
                <td class="status-error">❌</td>
                <td class="status-ok">✓</td>
                <td class="status-error">❌</td>
                <td class="firmware">F0.1.0.0.9.GC.004</td>
                <td>AT and MBIM</td>
            </tr>
            <tr>
                <td class="modem-name">Quectel RM502Q-GL</td>
                <td>N/A</td>
                <td class="status-ok">✓</td>
                <td class="status-ok">✓</td>
                <td class="status-ok">✓</td>
                <td class="status-ok">✓</td>
                <td class="firmware">RM502QGLAAR11A02M4G</td>
                <td>AT, QMI and MBIM</td>
            </tr>
            <tr>
                <td class="modem-name">Quectel RM551E-GL</td>
                <td>N/A</td>
                <td class="status-ok">✓</td>
                <td class="status-warning">⚠️</td>
                <td class="status-error">❌</td>
                <td class="status-warning">⚠️</td>
                <td class="firmware">RM551EGL00AAR01A03M8G</td>
                <td>AT and QMI</td>
            </tr>
        </tbody>
</table>
        
<div class="legend">
    <h2>Legend</h2>
        <ul>
            <li><span class="status-ok">✓</span> = Supported/Working</li>
            <li><span class="status-error">❌</span> = Not supported/Error</li>
            <li><span class="status-warning">⚠️</span> = Warning/Limited support</li>
            <li><span class="status-unknown">?</span> = Unknown/To be tested</li>
            <li>N/A = Not applicable</li>
        </ul>
</div>

Quectel **RM551E-GL** is still in ES stage, and its firmware has some problems during eSIM operation.
The following eSIMs were used as *Physical eSIM*:

1. [Lenovo eSIM](https://www.lenovo.com/it/it/p/accessories-and-software/mobile-broadband/4g-lte/4xc1l91362?srsltid=AfmBOop-6ZZktt9NIWFjj99BT6kyo4igJQ5mnAFZWyVHKY5bqYa6glcE)
2. [EIOTCLUB eSIM](https://www.eiotclub.com/products/physical-esim-card)

> **Note**: If you've tested the app with other modules/eSIMs, please share your experience via Issue or PR!