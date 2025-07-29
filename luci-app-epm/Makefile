# SPDX-License-Identifier: AGPL-3.0-only

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-epm
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_MAINTAINER:=Giammarco M. <stich86@gmail.com>
PKG_LICENSE:=AGPL-3.0-only

LUCI_TITLE:=LuCI eSIM Profile Manager
LUCI_DESCRIPTION:=LuCI web interface for managing eSIM profiles via lpac
LUCI_DEPENDS:=+luci-base +lpac +coreutils-timeout +uqmi +mbim-utils
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

$(eval $(call BuildPackage,luci-app-epm))