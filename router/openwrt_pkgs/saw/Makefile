include $(TOPDIR)/rules.mk

PKG_NAME:=saw
PKG_VERSION:=0.1.0
PKG_RELEASE:=0

include $(INCLUDE_DIR)/package.mk

define Package/saw
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=Smart Autonomous Wifi
	URL:=https://github.com/DanielSel/saw
	DEPENDS:=+node +node-grpc \
		+freeradius3 +freeradius3-mod-exec +freeradius3-mod-eap-ttls \
		+freeradius3-democerts \
		+hostapd-utils
endef

define Package/saw/description
	Smart Autonomous Wifi (SAW)
endef

define Package/saw/install
	$(INSTALL_DIR) $(1)/etc/saw
	cp -r ./files/etc/saw/* $(1)/etc/saw/
	$(INSTALL_DIR) $(1)/etc/freeradius3
	$(INSTALL_DIR) $(1)/etc/freeradius3/mods-enabled
	$(INSTALL_DATA) ./files/etc/freeradius3/mods-enabled/* $(1)/etc/freeradius3/mods-enabled/
	$(INSTALL_DIR) $(1)/etc/freeradius3/sites-enabled
	$(INSTALL_DATA) ./files/etc/freeradius3/sites-enabled/* $(1)/etc/freeradius3/sites-enabled/
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DATA) ./files/etc/config/saw $(1)/etc/config/saw
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/etc/init.d/saw $(1)/etc/init.d/saw
endef

define Package/saw/conffiles
/etc/config/saw
endef

define Package/saw/postinst
#!/bin/sh
# check if we are on real system
if [ -z "$${IPKG_INSTROOT}" ]; then
        echo "Installing NPM Packages for SAW"
		sed -i "/\"grpc\""/d /etc/saw/package.json
        cd /etc/saw && npm install
		echo "Disabling default FreeRADIUS configs"
		rm /etc/freeradius3/sites-enabled/default || echo "/etc/freeradius3/sites-enabled/default already disabled."
		rm /etc/freeradius3/sites-enabled/inner-tunnel || echo "/etc/freeradius3/sites-enabled/inner-tunnel already disabled."
        echo "Enabling rc.d symlink for SAW"
        /etc/init.d/saw enable
		echo "Enabling rc.d symlink for FreeRADIUS"
        /etc/init.d/radiusd enable
		echo "Starting SAW..."
        /etc/init.d/saw start
		echo "Starting FreeRADIUS.."
        /etc/init.d/radiusd start
fi
exit 0
endef

define Package/saw/prerm
#!/bin/sh
# check if we are on real system
if [ -z "$${IPKG_INSTROOT}" ]; then
		echo "Stopping FreeRADIUS..."
        /etc/init.d/radiusd stop
        echo "Stopping SAW..."
        /etc/init.d/saw stop
        echo "Removing rc.d symlink for SAW"
        /etc/init.d/saw disable
		echo "Removing rc.d symlink for FreeRADIUS"
        /etc/init.d/radiusd disable
fi
exit 0
endef

define Download
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Build/Install
endef

define Build/InstallDev
endef

define Build/Clean
endef

$(eval $(call BuildPackage,saw))
