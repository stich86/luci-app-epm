-- /usr/lib/lua/luci/model/cbi/epm.lua
local map = Map("epm", translate("eSIM Profile Manager"), translate("Manage eSIM profiles using lpac"))

-- Usa un template custom per i tab
map.template = "epm/main"

return map
