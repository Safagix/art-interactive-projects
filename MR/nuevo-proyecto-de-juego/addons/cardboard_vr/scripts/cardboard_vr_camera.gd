class_name CardboardVRCamera extends Camera3D

@export var Active: bool = true
@export_category("Controls")
@export var UseGysroscope: bool = true
@export var Mouse_Sensitivity: float = 0.003
@export var GysroscopeFactor: float = 0.2
@export var RotateParent: bool = true
@export var Handle_Mouse_Capture: bool = true
@export var Input_Cancel: String = "ui_cancel"

@export_category("Eyes")
@export_range(0.01, 1.0) var EyesSeparation: float = 0.03
@export_range(0, 5.0) var EyeHeight: float = 0.1
@export_range(-360, 360) var EyeConvergencyAngle: float = 0

var viewScene = preload("res://addons/cardboard_vr/scenes/CardboardView.tscn")
var left_camera_3d: Camera3D = Camera3D.new()
var right_camera_3d: Camera3D = Camera3D.new()
var LeftEyePivot: Node3D = Node3D.new()
var RightEyePivot: Node3D = Node3D.new()
var View: CardboardView
var LeftEyeSubViewPort: SubViewport = SubViewport.new()
var RightEyeSubViewPort: SubViewport = SubViewport.new()
var parent: Node3D = get_parent()

func _input(event):
	if not Active:
		return
		
	if Handle_Mouse_Capture:
		if event is InputEventMouseButton:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		elif Input.is_action_just_pressed(Input_Cancel):
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
			
	if not UseGysroscope and event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		if RotateParent:
			parent.rotate_y(- (event as InputEventMouseMotion).relative.x * Mouse_Sensitivity)
		LeftEyePivot.rotate_y(- (event as InputEventMouseMotion).relative.x * Mouse_Sensitivity)
		RightEyePivot.rotate_y(- (event as InputEventMouseMotion).relative.x * Mouse_Sensitivity)
		LeftEyePivot.rotate_object_local(Vector3.RIGHT, - (event as InputEventMouseMotion).relative.y * Mouse_Sensitivity)
		RightEyePivot.rotate_object_local(Vector3.RIGHT, - (event as InputEventMouseMotion).relative.y * Mouse_Sensitivity)
		LeftEyePivot.global_rotation.x = clamp(LeftEyePivot.global_rotation.x, deg_to_rad(-90), deg_to_rad(90))
		RightEyePivot.global_rotation.x = clamp(RightEyePivot.global_rotation.x, deg_to_rad(-90), deg_to_rad(90))
	
						
func _ready() -> void:
	# ANDROID FIX: Force orientation to Landscape (0)
	DisplayServer.screen_set_orientation(DisplayServer.SCREEN_LANDSCAPE)
	
	parent = get_parent()
	
	# ANDROID DEEP FIX: Enforce rendering updates and OPAQUE background
	# Transparent BG inside SubViewports is broken on many Android gl_compatibility implementations
	LeftEyeSubViewPort.transparent_bg = false
	RightEyeSubViewPort.transparent_bg = false
	LeftEyeSubViewPort.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	RightEyeSubViewPort.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	
	LeftEyePivot.add_child(left_camera_3d)
	LeftEyeSubViewPort.add_child(LeftEyePivot)
	RightEyePivot.add_child(right_camera_3d)
	RightEyeSubViewPort.add_child(RightEyePivot)
	
	View = viewScene.instantiate()
	add_child(View)
	
	# Add viewports to the root to avoid nesting issues on Android
	get_tree().root.add_child.call_deferred(LeftEyeSubViewPort)
	get_tree().root.add_child.call_deferred(RightEyeSubViewPort)
	
	# Link everything deferred
	_setup_vr.call_deferred()

func _setup_vr():
	# Recalculate size for landscape
	var win_size = get_viewport().get_visible_rect().size
	if win_size.y > win_size.x: # Fallback if still portrait
		var temp = win_size.x
		win_size.x = win_size.y
		win_size.y = temp
		
	LeftEyeSubViewPort.size = Vector2i(win_size.x / 2, win_size.y)
	RightEyeSubViewPort.size = Vector2i(win_size.x / 2, win_size.y)
	
	View.SetViewPorts(LeftEyeSubViewPort, RightEyeSubViewPort)
	_link_world()
	
	left_camera_3d.position.x = - (EyesSeparation)
	right_camera_3d.position.x = EyesSeparation
	LeftEyePivot.position.y = EyeHeight
	RightEyePivot.position.y = EyeHeight
	left_camera_3d.rotate_object_local(Vector3.UP, deg_to_rad(EyeConvergencyAngle))
	right_camera_3d.rotate_object_local(Vector3.UP, -deg_to_rad(EyeConvergencyAngle))

func _link_world():
	var main_world = get_viewport().find_world_3d()
	if main_world:
		LeftEyeSubViewPort.world_3d = main_world
		RightEyeSubViewPort.world_3d = main_world
		left_camera_3d.make_current()
		right_camera_3d.make_current()
	
func _process(delta: float) -> void:
	if not Active:
		return
		
	LeftEyePivot.global_position = Vector3(parent.global_position.x, parent.global_position.y + EyeHeight, parent.global_position.z)
	RightEyePivot.global_position = Vector3(parent.global_position.x, parent.global_position.y + EyeHeight, parent.global_position.z)
	
	if UseGysroscope:
		var gyroscope = Input.get_gyroscope() * GysroscopeFactor
		if RotateParent:
			parent.rotate_y(gyroscope.y * GysroscopeFactor)
		LeftEyePivot.rotate_y(gyroscope.y * GysroscopeFactor)
		RightEyePivot.rotate_y(gyroscope.y * GysroscopeFactor)
		LeftEyePivot.rotate_object_local(Vector3.RIGHT, gyroscope.x * GysroscopeFactor)
		RightEyePivot.rotate_object_local(Vector3.RIGHT, gyroscope.x * GysroscopeFactor)
		LeftEyePivot.rotation.x = clamp(LeftEyePivot.rotation.x, deg_to_rad(-90), deg_to_rad(90))
		RightEyePivot.rotation.x = clamp(RightEyePivot.rotation.x, deg_to_rad(-90), deg_to_rad(90))
