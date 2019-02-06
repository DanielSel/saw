/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.saw.Pop', null, global);
goog.exportSymbol('proto.saw.PopStatus', null, global);
goog.exportSymbol('proto.saw.PopStatusCode', null, global);
goog.exportSymbol('proto.saw.SessionIdRequest', null, global);
goog.exportSymbol('proto.saw.SessionIdResponse', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.saw.Pop = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.saw.Pop, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.saw.Pop.displayName = 'proto.saw.Pop';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.saw.Pop.prototype.toObject = function(opt_includeInstance) {
  return proto.saw.Pop.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.saw.Pop} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.Pop.toObject = function(includeInstance, msg) {
  var f, obj = {
    sessionhash: jspb.Message.getFieldWithDefault(msg, 1, 0),
    accTime: jspb.Message.getFieldWithDefault(msg, 2, 0),
    signature: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.saw.Pop}
 */
proto.saw.Pop.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.saw.Pop;
  return proto.saw.Pop.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.saw.Pop} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.saw.Pop}
 */
proto.saw.Pop.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readFixed64());
      msg.setSessionhash(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccTime(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setSignature(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.saw.Pop.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.saw.Pop.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.saw.Pop} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.Pop.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSessionhash();
  if (f !== 0) {
    writer.writeFixed64(
      1,
      f
    );
  }
  f = message.getAccTime();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getSignature();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional fixed64 sessionHash = 1;
 * @return {number}
 */
proto.saw.Pop.prototype.getSessionhash = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.saw.Pop.prototype.setSessionhash = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional uint32 acc_time = 2;
 * @return {number}
 */
proto.saw.Pop.prototype.getAccTime = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.saw.Pop.prototype.setAccTime = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional string signature = 3;
 * @return {string}
 */
proto.saw.Pop.prototype.getSignature = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.saw.Pop.prototype.setSignature = function(value) {
  jspb.Message.setProto3StringField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.saw.PopStatus = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.saw.PopStatus, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.saw.PopStatus.displayName = 'proto.saw.PopStatus';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.saw.PopStatus.prototype.toObject = function(opt_includeInstance) {
  return proto.saw.PopStatus.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.saw.PopStatus} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.PopStatus.toObject = function(includeInstance, msg) {
  var f, obj = {
    state: jspb.Message.getFieldWithDefault(msg, 1, 0),
    msg: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.saw.PopStatus}
 */
proto.saw.PopStatus.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.saw.PopStatus;
  return proto.saw.PopStatus.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.saw.PopStatus} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.saw.PopStatus}
 */
proto.saw.PopStatus.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.saw.PopStatusCode} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setMsg(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.saw.PopStatus.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.saw.PopStatus.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.saw.PopStatus} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.PopStatus.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getMsg();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional PopStatusCode state = 1;
 * @return {!proto.saw.PopStatusCode}
 */
proto.saw.PopStatus.prototype.getState = function() {
  return /** @type {!proto.saw.PopStatusCode} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.saw.PopStatusCode} value */
proto.saw.PopStatus.prototype.setState = function(value) {
  jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional string msg = 2;
 * @return {string}
 */
proto.saw.PopStatus.prototype.getMsg = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.saw.PopStatus.prototype.setMsg = function(value) {
  jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.saw.SessionIdRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.saw.SessionIdRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.saw.SessionIdRequest.displayName = 'proto.saw.SessionIdRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.saw.SessionIdRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.saw.SessionIdRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.saw.SessionIdRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.SessionIdRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    ethAddress: jspb.Message.getFieldWithDefault(msg, 1, ""),
    signature: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.saw.SessionIdRequest}
 */
proto.saw.SessionIdRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.saw.SessionIdRequest;
  return proto.saw.SessionIdRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.saw.SessionIdRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.saw.SessionIdRequest}
 */
proto.saw.SessionIdRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setEthAddress(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setSignature(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.saw.SessionIdRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.saw.SessionIdRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.saw.SessionIdRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.SessionIdRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEthAddress();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSignature();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string eth_address = 1;
 * @return {string}
 */
proto.saw.SessionIdRequest.prototype.getEthAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.saw.SessionIdRequest.prototype.setEthAddress = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string signature = 2;
 * @return {string}
 */
proto.saw.SessionIdRequest.prototype.getSignature = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.saw.SessionIdRequest.prototype.setSignature = function(value) {
  jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.saw.SessionIdResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.saw.SessionIdResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.saw.SessionIdResponse.displayName = 'proto.saw.SessionIdResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.saw.SessionIdResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.saw.SessionIdResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.saw.SessionIdResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.SessionIdResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    sessionhash: jspb.Message.getFieldWithDefault(msg, 1, 0),
    success: (f = msg.getSuccess()) && proto.saw.PopStatus.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.saw.SessionIdResponse}
 */
proto.saw.SessionIdResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.saw.SessionIdResponse;
  return proto.saw.SessionIdResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.saw.SessionIdResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.saw.SessionIdResponse}
 */
proto.saw.SessionIdResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readFixed64());
      msg.setSessionhash(value);
      break;
    case 2:
      var value = new proto.saw.PopStatus;
      reader.readMessage(value,proto.saw.PopStatus.deserializeBinaryFromReader);
      msg.setSuccess(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.saw.SessionIdResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.saw.SessionIdResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.saw.SessionIdResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.saw.SessionIdResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSessionhash();
  if (f !== 0) {
    writer.writeFixed64(
      1,
      f
    );
  }
  f = message.getSuccess();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.saw.PopStatus.serializeBinaryToWriter
    );
  }
};


/**
 * optional fixed64 sessionHash = 1;
 * @return {number}
 */
proto.saw.SessionIdResponse.prototype.getSessionhash = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.saw.SessionIdResponse.prototype.setSessionhash = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional PopStatus success = 2;
 * @return {?proto.saw.PopStatus}
 */
proto.saw.SessionIdResponse.prototype.getSuccess = function() {
  return /** @type{?proto.saw.PopStatus} */ (
    jspb.Message.getWrapperField(this, proto.saw.PopStatus, 2));
};


/** @param {?proto.saw.PopStatus|undefined} value */
proto.saw.SessionIdResponse.prototype.setSuccess = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.saw.SessionIdResponse.prototype.clearSuccess = function() {
  this.setSuccess(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.saw.SessionIdResponse.prototype.hasSuccess = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * @enum {number}
 */
proto.saw.PopStatusCode = {
  POP_OK: 0,
  POP_TIMEOUT: 1,
  POP_INVALID: 2,
  POP_CONNECTION_ERROR: 3,
  POP_NO_CLUE_WHATS_WRONG: 4
};

goog.object.extend(exports, proto.saw);
