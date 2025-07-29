# LuCI Web Interface App for managing eSIM profiles via lpac

## 🎯 **What does this app do?**

**luci-app-epm** is a LuCI web interface for OpenWrt that allows easy management of eSIM profiles on compatible cellular modules. The application uses **lpac** (Local Profile Agent Client) to communicate with eSIM modules and provides an intuitive user interface for:

- 📊 **Monitor Status** of eSIM module
- 📥 **Download Profiles** via QR codes or manual entry  
- 🔄 **Manage Existing Profiles** (enable/disable/delete/rename)
- 🪛 **Configure LPAC backend and Modem Reboot** (via AT, QMI, MBIM or Custom command)
- 🔔 **Notifications** for status and operations
- 🌐 **Connectivity Testing** before managing eSIM profiles

**🚀 Happy eSIM managing!** If the app is useful to you, leave a ⭐ on GitHub!
> **Remember**: This is a community-driven project. Every contribution, big or small, is valuable! 💝

## 🛠️ **Requirements**

- OpenWrt with LuCI interface
- Packages `lpac`, `uqmi`, `mbimcli` and `coreutils-timeout` installed
- Cellular module with eSIM (physical or embedded) support
- Internet connection (for profile download and delete)
> **Note**: MBIM support needs at least LPAC 2.2.0 version

# Links

- [Tested Modules and eSIMs](asset/test_modem_esim.md)
- [Screenshots](asset/screenshots.md)
- [Installation](asset/installation.md)


## 🤝 **Contributing**

This application was developed using **vibecoding** and may contain non-perfect optimizations or improvable code.
Contributions are **very welcome**! 
 

### How to contribute:

1. **🐛 Bug Reports**: Found a bug? Open an [Issue](https://github.com/stich86/luci-app-epm/issues)
2. **💡 Feature Requests**: Have an idea to improve the app? Share it via Issue
3. **🔧 Pull Requests**: Fixed something or added functionality? Submit a PR!
4. **📝 Documentation**: Help improve docs and README
5. **🧪 Testing**: Test on different modules/eSIMs and share results


## 🙏 **Acknowledgments**

- **[estkme-group](https://github.com/estkme-group/lpac)** for the fantastic lpac eSIM client
- **[cozmo](https://github.com/cozmo/jsQR)** for his JavaScript QRCode library 
- **[OpenWrt community & LuCI developers](https://openwrt.org/)** for the ecosystem 
- **Vibecoding** for... the vibe! 🎵