extends XROrigin3D

func _ready():
	# EMERGENCY DIAGNOSTIC: DISABLE VR TO TEST RENDERING
	# var interface = XRServer.find_interface("Native mobile")
	# if interface and interface.initialize():
	# 	get_viewport().use_xr = true
	# 	print("✅ VR Interface Initialized (Native mobile)")
	# else:
	# 	printerr("❌ VR Interface Failed to Initialize")
	print("⚠️ SAFEMODE: VR DISABLED - TESTING 2D OUTPUT")
