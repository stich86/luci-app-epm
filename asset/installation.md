## 🚀 **Installation**

You can download latest ipk from Release Page and install using the command:

`opkg install luci-app-epm_1.0.0-r1_all.ipk`


## 🎨 **Compile by yourself**

Add next line to `feeds.conf.default` in OpenWrt SDK/Buildroot:

`src-git epm https://github.com/stich86/luci-app-epm.git`

Update feeds and compile the package:

```./scripts/feeds update -a; ./scripts/feeds install -a
make -j$((`nproc` + 1)) package/feeds/epm/luci-app-epm/compile
```

The compiled package will be at:

`SDKROOT/bin/packages/aarch64_cortex-a53/epm/luci-app-epm_1.0.0-r1_all.ipk`

### Project structure

```
➜  luci-app-epm:
.
├── htdocs
│   └── luci-static
│       └── resources		// CSS, JS
├── luasrc
│   ├── controller		// LuCI LUA controller
│   ├── model
│   │   └── cbi         	// CBI model
│   └── view
│       └── epm 		// HTML templates
└── root
    ├── etc
    │   └── config 		// Configuration file
    └── usr
        └── share
            └── menu.d  	// Menu definition

```