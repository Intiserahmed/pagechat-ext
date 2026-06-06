var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __asyncGenerator = (__this, __arguments, generator) => {
  var resume = (k, v, yes, no) => {
    try {
      var x = generator[k](v), isAwait = (v = x.value) instanceof __await, done = x.done;
      Promise.resolve(isAwait ? v[0] : v).then((y) => isAwait ? resume(k === "return" ? k : "next", v[1] ? { done: y.done, value: y.value } : y, yes, no) : yes({ value: y, done })).catch((e) => resume("throw", e, yes, no));
    } catch (e) {
      no(e);
    }
  }, method = (k) => it[k] = (x) => new Promise((yes, no) => resume(k, x, yes, no)), it = {};
  return generator = generator.apply(__this, __arguments), it[__knownSymbol("asyncIterator")] = () => it, method("next"), method("throw"), method("return"), it;
};
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);

// src/glue/messages.ts
var GLUE_VERSION = 1;
var GLUE_MESSAGE_PROTOTYPES = {
  "erro_evt": {
    "name": "erro_evt",
    "structName": "glue_msg_error",
    "className": "GlueMsgError",
    "fields": [
      {
        "type": "str",
        "name": "message",
        "isNullable": false
      }
    ]
  },
  "load_req": {
    "name": "load_req",
    "structName": "glue_msg_load_req",
    "className": "GlueMsgLoadReq",
    "fields": [
      {
        "type": "arr_str",
        "name": "model_paths",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "mmproj_path",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "n_ctx_auto",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "use_mmap",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "use_mlock",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_gpu_layers",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ctx",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_threads",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "model_alias",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "log_level",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "embeddings",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "offload_kqv",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_batch",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_ubatch",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_parallel",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "pooling_type",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "rope_scaling_type",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "rope_freq_base",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "rope_freq_scale",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_ext_factor",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_attn_factor",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_beta_fast",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_beta_slow",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "yarn_orig_ctx",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "cache_type_k",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "cache_type_v",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "kv_unified",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "flash_attn",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "swa_full",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_ctx_checkpoints",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "checkpoint_min_step",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "chat_template",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "jinja",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "default_template_kwargs_keys",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "default_template_kwargs_vals",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "reasoning",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "image_min_tokens",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "image_max_tokens",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "warmup",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "no_kv_offload",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "mmproj_offload",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "cont_batching",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_keep",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "ctx_shift",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "cache_idle_slots",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_cache_reuse",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "lora_paths",
        "isNullable": true
      },
      {
        "type": "arr_float",
        "name": "lora_scales",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "lora_init_without_apply",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "spec_draft_model",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_ngl",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_n_max",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_n_min",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "spec_draft_p_min",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_threads",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_threads_batch",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "kv_overrides_keys",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "kv_overrides_vals",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "reasoning_budget_tokens",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "reasoning_budget_message",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "reasoning_format",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "skip_chat_parsing",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "prefill_assistant",
        "isNullable": true
      }
    ]
  },
  "load_res": {
    "name": "load_res",
    "structName": "glue_msg_load_res",
    "className": "GlueMsgLoadRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ctx",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_batch",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ubatch",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_vocab",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ctx_train",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_embd",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_layer",
        "isNullable": false
      },
      {
        "type": "arr_str",
        "name": "metadata_key",
        "isNullable": false
      },
      {
        "type": "arr_str",
        "name": "metadata_val",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_bos",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_eos",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_eot",
        "isNullable": false
      },
      {
        "type": "arr_int",
        "name": "list_tokens_eog",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "add_bos_token",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "add_eos_token",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_encoder",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_decoder_start",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "media_marker",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_image_input",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_audio_input",
        "isNullable": false
      }
    ]
  },
  "cmpl_req": {
    "name": "cmpl_req",
    "structName": "glue_msg_completion_req",
    "className": "GlueMsgCompletionReq",
    "fields": [
      {
        "type": "bool",
        "name": "is_chat",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      },
      {
        "type": "arr_raw",
        "name": "files",
        "isNullable": false
      }
    ]
  },
  "cmpl_res": {
    "name": "cmpl_res",
    "structName": "glue_msg_completion_res",
    "className": "GlueMsgCompletionRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      }
    ]
  },
  "embd_req": {
    "name": "embd_req",
    "structName": "glue_msg_embedding_req",
    "className": "GlueMsgEmbeddingReq",
    "fields": [
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      },
      {
        "type": "arr_raw",
        "name": "files",
        "isNullable": false
      }
    ]
  },
  "embd_res": {
    "name": "embd_res",
    "structName": "glue_msg_embedding_res",
    "className": "GlueMsgEmbeddingRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      }
    ]
  },
  "rrnk_req": {
    "name": "rrnk_req",
    "structName": "glue_msg_rerank_req",
    "className": "GlueMsgRerankReq",
    "fields": [
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      }
    ]
  },
  "rrnk_res": {
    "name": "rrnk_res",
    "structName": "glue_msg_rerank_res",
    "className": "GlueMsgRerankRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      }
    ]
  },
  "gres_req": {
    "name": "gres_req",
    "structName": "glue_msg_get_result_req",
    "className": "GlueMsgGetResultReq",
    "fields": []
  },
  "gres_res": {
    "name": "gres_res",
    "structName": "glue_msg_get_result_res",
    "className": "GlueMsgGetResultRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_more",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "is_error",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      }
    ]
  },
  "tbop_req": {
    "name": "tbop_req",
    "structName": "glue_msg_test_backend_ops_req",
    "className": "GlueMsgTestBackendOpsReq",
    "fields": [
      {
        "type": "arr_str",
        "name": "args",
        "isNullable": false
      }
    ]
  },
  "tbop_res": {
    "name": "tbop_res",
    "structName": "glue_msg_test_backend_ops_res",
    "className": "GlueMsgTestBackendOpsRes",
    "fields": [
      {
        "type": "int",
        "name": "retcode",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      }
    ]
  }
};

// src/glue/glue.ts
var GLUE_MAGIC = new Uint8Array([71, 76, 85, 69]);
var GLUE_DTYPE_NULL = 0;
var GLUE_DTYPE_BOOL = 1;
var GLUE_DTYPE_INT = 2;
var GLUE_DTYPE_FLOAT = 3;
var GLUE_DTYPE_STRING = 4;
var GLUE_DTYPE_RAW = 5;
var GLUE_DTYPE_ARRAY_BOOL = 6;
var GLUE_DTYPE_ARRAY_INT = 7;
var GLUE_DTYPE_ARRAY_FLOAT = 8;
var GLUE_DTYPE_ARRAY_STRING = 9;
var GLUE_DTYPE_ARRAY_RAW = 10;
var TYPE_MAP = {
  str: GLUE_DTYPE_STRING,
  int: GLUE_DTYPE_INT,
  float: GLUE_DTYPE_FLOAT,
  bool: GLUE_DTYPE_BOOL,
  raw: GLUE_DTYPE_RAW,
  arr_str: GLUE_DTYPE_ARRAY_STRING,
  arr_int: GLUE_DTYPE_ARRAY_INT,
  arr_float: GLUE_DTYPE_ARRAY_FLOAT,
  arr_bool: GLUE_DTYPE_ARRAY_BOOL,
  arr_raw: GLUE_DTYPE_ARRAY_RAW,
  null: GLUE_DTYPE_NULL
};
function glueDeserialize(buf) {
  let offset = 0;
  const view = new DataView(buf.buffer);
  const readUint32 = () => {
    const value = view.getUint32(offset, true);
    offset += 4;
    return value;
  };
  const readInt32 = () => {
    const value = view.getInt32(offset, true);
    offset += 4;
    return value;
  };
  const readFloat = () => {
    const value = view.getFloat32(offset, true);
    offset += 4;
    return value;
  };
  const readBool = () => {
    return readUint32() !== 0;
  };
  const readString = (customLen) => {
    const length = customLen != null ? customLen : readUint32();
    const value = new TextDecoder().decode(buf.slice(offset, offset + length));
    offset += length;
    return value;
  };
  const readRaw = () => {
    const length = readUint32();
    const value = buf.slice(offset, offset + length);
    offset += length;
    return value;
  };
  const readArray = (readItem) => {
    const length = readUint32();
    const value = new Array(length);
    for (let i = 0; i < length; i++) {
      value[i] = readItem();
    }
    return value;
  };
  const readNull = () => null;
  const readField = (field) => {
    switch (field.type) {
      case "str":
        return readString();
      case "int":
        return readInt32();
      case "float":
        return readFloat();
      case "bool":
        return readBool();
      case "raw":
        return readRaw();
      case "arr_str":
        return readArray(readString);
      case "arr_int":
        return readArray(readInt32);
      case "arr_float":
        return readArray(readFloat);
      case "arr_bool":
        return readArray(readBool);
      case "arr_raw":
        return readArray(readRaw);
      case "null":
        return readNull();
    }
  };
  const magicValid = buf[0] === GLUE_MAGIC[0] && buf[1] === GLUE_MAGIC[1] && buf[2] === GLUE_MAGIC[2] && buf[3] === GLUE_MAGIC[3];
  offset += 4;
  if (!magicValid) {
    throw new Error("Invalid magic number");
  }
  const version = readUint32();
  if (version !== GLUE_VERSION) {
    throw new Error("Invalid version number");
  }
  const name = readString(8);
  const msgProto = GLUE_MESSAGE_PROTOTYPES[name];
  if (!msgProto) {
    throw new Error(`Unknown message name: ${name}`);
  }
  const output = { _name: name };
  for (const field of msgProto.fields) {
    const readType = readUint32();
    if (readType === GLUE_DTYPE_NULL) {
      if (!field.isNullable) {
        throw new Error(
          `${name}: Expect field ${field.name} to be non-nullable`
        );
      }
      output[field.name] = null;
      continue;
    }
    if (readType !== TYPE_MAP[field.type]) {
      throw new Error(
        `${name}: Expect field ${field.name} to have type ${field.type}`
      );
    }
    output[field.name] = readField(field);
  }
  return output;
}
function glueSerialize(msg) {
  const msgProto = GLUE_MESSAGE_PROTOTYPES[msg._name];
  if (!msgProto) {
    throw new Error(`Unknown message name: ${msg._name}`);
  }
  const bufs = [];
  const writeUint32 = (value) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setUint32(0, value, true);
    bufs.push(new Uint8Array(buf));
  };
  const writeInt32 = (value) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setInt32(0, value, true);
    bufs.push(new Uint8Array(buf));
  };
  const writeFloat = (value) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setFloat32(0, value, true);
    bufs.push(new Uint8Array(buf));
  };
  const writeBool = (value) => {
    writeUint32(value ? 1 : 0);
  };
  const writeString = (value) => {
    const utf8 = new TextEncoder().encode(value);
    writeUint32(utf8.byteLength);
    bufs.push(utf8);
  };
  const writeRaw = (value) => {
    writeUint32(value.byteLength);
    bufs.push(value);
  };
  const writeArray = (value, writeItem) => {
    writeUint32(value.length);
    for (const item of value) {
      writeItem(item);
    }
  };
  const writeNull = () => {
  };
  bufs.push(GLUE_MAGIC);
  writeUint32(GLUE_VERSION);
  {
    const utf8 = new TextEncoder().encode(msg._name);
    bufs.push(utf8);
  }
  for (const field of msgProto.fields) {
    const val = msg[field.name];
    if (!field.isNullable && (val === null || val === void 0)) {
      throw new Error(
        `${msg._name}: Expect field ${field.name} to be non-nullable`
      );
    }
    if (val === null || val === void 0) {
      writeUint32(GLUE_DTYPE_NULL);
      continue;
    }
    writeUint32(TYPE_MAP[field.type]);
    switch (field.type) {
      case "str":
        writeString(val);
        break;
      case "int":
        writeInt32(val);
        break;
      case "float":
        writeFloat(val);
        break;
      case "bool":
        writeBool(val);
        break;
      case "raw":
        writeRaw(val);
        break;
      case "arr_str":
        writeArray(val, writeString);
        break;
      case "arr_int":
        writeArray(val, writeInt32);
        break;
      case "arr_float":
        writeArray(val, writeFloat);
        break;
      case "arr_bool":
        writeArray(val, writeBool);
        break;
      case "arr_raw":
        writeArray(val, writeRaw);
        break;
      case "null":
        writeNull();
        break;
    }
  }
  const totalLength = bufs.reduce((acc, buf) => acc + buf.byteLength, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of bufs) {
    output.set(buf, offset);
    offset += buf.byteLength;
  }
  return output;
}

// src/wasm/source-map.ts
var WASM_SOURCE_MAP = {
  "default": "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",
  "compat": "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"
};

// src/debug.ts
var cache = /* @__PURE__ */ new Map();
function loadMap(buildKey) {
  return __async(this, null, function* () {
    if (cache.has(buildKey)) return cache.get(buildKey);
    const b64 = WASM_SOURCE_MAP[buildKey];
    if (!b64) throw new Error(`No source map for build "${buildKey}"`);
    const gzipped = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    writer.write(gzipped);
    writer.close();
    const buf = yield new Response(ds.readable).arrayBuffer();
    const dv = new DataView(buf);
    const bytes = new Uint8Array(buf);
    const firstId = dv.getUint32(0, true);
    const funcCount = dv.getUint32(4, true);
    const numNames = dv.getUint32(8, true);
    const td = new TextDecoder();
    const names = [];
    let pos = 12;
    for (let i = 0; i < numNames; i++) {
      const len = bytes[pos++];
      names.push(td.decode(bytes.subarray(pos, pos + len)));
      pos += len;
    }
    const funcNames = [];
    for (let i = 0; i < funcCount; i++) {
      const idx = dv.getUint16(pos, true);
      pos += 2;
      funcNames.push(idx === 65535 ? null : names[idx]);
    }
    const entry = { firstId, funcNames };
    cache.set(buildKey, entry);
    return entry;
  });
}
var Debug = {
  /**
   * Resolves a list of wasm function indices to their cleaned symbol names.
   */
  decodeFuncIds: (funcIds, isCompatBuild) => __async(void 0, null, function* () {
    const buildKey = isCompatBuild ? "compat" : "default";
    const { firstId, funcNames } = yield loadMap(buildKey);
    return funcIds.map((funcId) => {
      const i = funcId - firstId;
      const name = i >= 0 && i < funcNames.length && funcNames[i] ? funcNames[i] : "(unknown)";
      return { funcId, name };
    });
  }),
  /**
   * Annotates a wasm stack trace string with resolved function names.
   *
   * Example input from Chrome:
   *   at http://localhost:8080/esm/wasm/wllama.wasm:wasm-function[775]:0x74251
   *   at async blob:http://localhost:8080/53a863cc-7227-45cc-8594-ddbbf5257f20:317:28
   *
   * Example input from Firefox:
   *   @http://localhost:8080/esm/wasm/wllama.wasm:wasm-function[796]:0x7dfe2
   *       at wModuleInit/WebAssembly.promising/< (9b6a2acd-d909-44e2-b021-d42fb9087cfb:15:32) index.js:1433:45
   *
   * Example input from Safari:
   *   2441@wasm-function[2441]
   *       at wrapper (d746f19e-4523-4f36-ba06-d0969acc0b05:22:126009)
   *
   * Example output:
   *   wasm-func[775] (server_response::send)
   */
  decodeStackTrace: (stack, isCompatBuild) => __async(void 0, null, function* () {
    const re = /wasm-function\[(\d+)\]/g;
    const funcIds = [
      ...new Set([...stack.matchAll(re)].map((m) => parseInt(m[1])))
    ];
    if (funcIds.length === 0) return stack;
    const resolved = yield Debug.decodeFuncIds(funcIds, isCompatBuild);
    return resolved.map((r) => {
      if (r.name === "(unknown)") {
        return `    wasm-func[${r.funcId}] (unknown)`;
      }
      return `    wasm-func[${r.funcId}] (${r.name})`;
    }).join("\n");
  })
};

// src/utils.ts
var textDecoder = new TextDecoder();
var URL_PARTS_REGEX = /-(\d{5})-of-(\d{5})\.gguf(?:\?.*)?$/;
var parseShardNumber = (fnameOrUrl) => {
  const matches = fnameOrUrl.match(URL_PARTS_REGEX);
  if (!matches) {
    return {
      baseURL: fnameOrUrl,
      current: 1,
      total: 1
    };
  } else {
    return {
      baseURL: fnameOrUrl.replace(URL_PARTS_REGEX, ""),
      current: parseInt(matches[1]),
      total: parseInt(matches[2])
    };
  }
};
var sortFileByShard = (blobs) => {
  const isFiles = blobs.every((b) => !!b.name);
  if (isFiles && blobs.length > 1) {
    const files = blobs;
    files.sort((a, b) => {
      const infoA = parseShardNumber(a.name);
      const infoB = parseShardNumber(b.name);
      return infoA.current - infoB.current;
    });
  }
};
var isMmproj = (blob) => __async(void 0, null, function* () {
  const META_NAME = "general.architecture";
  const META_VAL = "clip";
  const tmp = blob.slice(0, 128 * 1024);
  const header = yield tmp.arrayBuffer();
  const buf = new Uint8Array(header);
  const nameBytes = new TextEncoder().encode(META_NAME);
  const valBytes = new TextEncoder().encode(META_VAL);
  let offset = -1;
  outer: for (let i = 0; i <= buf.length - nameBytes.length; i++) {
    for (let j = 0; j < nameBytes.length; j++) {
      if (buf[i + j] !== nameBytes[j]) continue outer;
    }
    offset = i;
    break;
  }
  if (offset === -1) return false;
  if (offset + 8 * 4 + 4 > buf.length) return false;
  const view = new DataView(header);
  const valLen = view.getBigUint64(offset + 8 * 3, true);
  if (valLen !== /* @__PURE__ */ BigInt("4")) return false;
  for (let i = 0; i < valBytes.length; i++) {
    if (buf[offset + 8 * 4 + i] !== valBytes[i]) return false;
  }
  return true;
});
var absoluteUrl = (relativePath) => new URL(relativePath, document.baseURI).href;
var padDigits = (number, digits) => {
  return Array(Math.max(digits - String(number).length + 1, 0)).join("0") + number;
};
var sumArr = (arr) => arr.reduce((prev, curr) => prev + curr, 0);
var isString = (value) => !!(value == null ? void 0 : value.startsWith);
var MMPROJ_FILE_NAME = "mmproj.gguf";
var prepareBlobs = (blobsInp) => __async(void 0, null, function* () {
  const blobs = [];
  let blobMmproj = null;
  for (const blob of blobsInp) {
    if (yield isMmproj(blob)) {
      blobMmproj = blob;
    } else {
      blobs.push(blob);
    }
  }
  sortFileByShard(blobs);
  const result = blobs.map((blob, i) => ({
    blob,
    name: `model-${padDigits(i + 1, 5)}-of-${padDigits(blobs.length, 5)}.gguf`
  }));
  if (blobMmproj) {
    result.push({
      blob: blobMmproj,
      name: MMPROJ_FILE_NAME
    });
  }
  return {
    llm: result.filter((f) => f.name !== MMPROJ_FILE_NAME),
    mmproj: blobMmproj ? { blob: blobMmproj, name: MMPROJ_FILE_NAME } : null,
    all: result
  };
});
var isSupportMultiThread = () => ((e) => __async(void 0, null, function* () {
  try {
    return "undefined" != typeof MessageChannel && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(e);
  } catch (e2) {
    return false;
  }
}))(
  new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    4,
    1,
    96,
    0,
    0,
    3,
    2,
    1,
    0,
    5,
    4,
    1,
    3,
    1,
    1,
    10,
    11,
    1,
    9,
    0,
    65,
    0,
    254,
    16,
    2,
    0,
    26,
    11
  ])
);
var isSupportExceptions = () => __async(void 0, null, function* () {
  return WebAssembly.validate(
    new Uint8Array([
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      4,
      1,
      96,
      0,
      0,
      3,
      2,
      1,
      0,
      10,
      8,
      1,
      6,
      0,
      6,
      64,
      25,
      11,
      11
    ])
  );
});
var isSupportSIMD = () => __async(void 0, null, function* () {
  return WebAssembly.validate(
    new Uint8Array([
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      5,
      1,
      96,
      0,
      1,
      123,
      3,
      2,
      1,
      0,
      10,
      10,
      1,
      8,
      0,
      65,
      0,
      253,
      15,
      253,
      98,
      11
    ])
  );
});
var isSupportJSPI = () => {
  return !!WebAssembly.Suspending;
};
var isSupportWebGPU = () => {
  return !!navigator.gpu;
};
var isSupportMem64 = () => {
  try {
    new WebAssembly.Memory({
      address: "i64",
      initial: /* @__PURE__ */ BigInt("1")
      // 1 page (64 KiB)
    });
    return true;
  } catch (e) {
    return false;
  }
};
var checkEnvironmentCompatible = () => __async(void 0, null, function* () {
  if (!(yield isSupportExceptions())) {
    throw new Error("WebAssembly runtime does not support exception handling");
  }
  if (!(yield isSupportSIMD())) {
    throw new Error("WebAssembly runtime does not support SIMD");
  }
});
var isFirefox = () => {
  return !!navigator.userAgent.match(/Firefox\/([0-9\.]+)(?:\s|$)/);
};
var GGUF_FILE_REGEX = /^.*\.gguf(?:\?.*)?$/;
var isValidGgufFile = (path) => {
  return GGUF_FILE_REGEX.test(path);
};
var isSafariMobile = () => {
  return !!navigator.userAgent.match(/Version\/([0-9\._]+).*Mobile.*Safari.*/);
};
var createWorker = (workerCode) => {
  const workerURL = URL.createObjectURL(
    isString(workerCode) ? new Blob([workerCode], { type: "text/javascript" }) : workerCode
  );
  return new Worker(workerURL, { type: "module" });
};
var cbToAsyncIter = (fn) => (...args) => {
  let values = [];
  let resolve;
  let reject;
  values.push(
    new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    })
  );
  fn(...args, (val, done, err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve([val, done]);
    values.push(
      new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      })
    );
  });
  return function() {
    return __asyncGenerator(this, null, function* () {
      let val;
      for (let i = 0, done = false; !done; i++) {
        [val, done] = yield new __await(values[i]);
        delete values[i];
        if (val !== void 0) yield val;
      }
    });
  }();
};
var canUseAsyncFileRead = (compat) => isSupportJSPI() || compat;
var needCompat = () => !isSupportJSPI() || !isSupportMem64();

// src/workers-code/generated.ts
var LIBLLAMA_VERSION = "b9437-aa46bda";
var LLAMA_CPP_WORKER_CODE = "// Start the main llama.cpp\nlet wllamaMalloc;\nlet wllamaStart;\nlet wllamaAction;\nlet wllamaExit;\nlet wllamaDebug;\n\nlet Module = null;\nlet isCompat = false;\nlet lastStack = '';\nlet isAborted = false;\nlet hasMultithread = false;\n\n//////////////////////////////////////////////////////////////\n// UTILS\n//////////////////////////////////////////////////////////////\n\n// send message back to main thread\nconst msg = (data, transfer) => postMessage(data, transfer);\n\n// Convert CPP log into JS log\nconst cppLogToJSLog = (line) => {\n  const matched = line.match(/@@(DEBUG|INFO|WARN|ERROR)@@(.*)/);\n  return !!matched\n    ? {\n        level: (matched[1] === 'INFO' ? 'debug' : matched[1]).toLowerCase(),\n        text: matched[2],\n      }\n    : { level: 'log', text: line };\n};\n\nconst getHeapU8 = () => {\n  const buffer = Module.wasmMemory.buffer;\n  return new Uint8Array(buffer);\n};\n\nconst toSizeT = (num) => {\n  return isCompat ? Number(num) : BigInt(num);\n};\n\n// Get module config that forwards stdout/err to main thread\nconst getWModuleConfig = (_argMainScriptBlob) => {\n  var pathConfig = RUN_OPTIONS.pathConfig;\n  var pthreadPoolSize = RUN_OPTIONS.nbThread;\n  var argMainScriptBlob = _argMainScriptBlob;\n\n  isCompat = RUN_OPTIONS.compat;\n  hasMultithread = pthreadPoolSize > 1;\n\n  msg({\n    verb: 'console.debug',\n    args: [\n      `Multithread enabled: ${hasMultithread}, pthreadPoolSize: ${pthreadPoolSize}`,\n    ],\n  });\n\n  if (!pathConfig['wllama.wasm']) {\n    throw new Error('\"wllama.wasm\" is missing in pathConfig');\n  }\n  return {\n    noInitialRun: true,\n    print: function (text) {\n      if (arguments.length > 1)\n        text = Array.prototype.slice.call(arguments).join(' ');\n      msg({ verb: 'console.log', args: [text] });\n    },\n    printErr: function (text) {\n      if (arguments.length > 1)\n        text = Array.prototype.slice.call(arguments).join(' ');\n      if (text.startsWith('@@STACK@@')) {\n        lastStack = text.slice('@@STACK@@'.length);\n        return;\n      }\n      const logLine = cppLogToJSLog(text);\n      msg({ verb: 'console.' + logLine.level, args: [logLine.text] });\n    },\n    locateFile: function (filename, basePath) {\n      const p = pathConfig[filename];\n      const truncate = (str) =>\n        str.length > 128 ? `${str.substr(0, 128)}...` : str;\n      if (filename.match(/wllama\\.worker\\.js/)) {\n        msg({\n          verb: 'console.error',\n          args: [\n            '\"wllama.worker.js\" is removed from v2.2.1. Hint: make sure to clear browser\\'s cache.',\n          ],\n        });\n      } else {\n        msg({\n          verb: 'console.debug',\n          args: [`Loading \"${filename}\" from \"${truncate(p)}\"`],\n        });\n        return p;\n      }\n    },\n    mainScriptUrlOrBlob: hasMultithread\n      ? argMainScriptBlob\n      : 'throw new Error(\"Multithreading is not enabled\")',\n    pthreadPoolSize: hasMultithread ? pthreadPoolSize : 0,\n    wasmMemory: hasMultithread ? getWasmMemory() : null,\n    onAbort: function (message) {\n      isAborted = true;\n      msg({ verb: 'signal.abort', args: ['abort', message, lastStack, null] });\n    },\n    onExit: function (code) {\n      isAborted = true;\n      const callstack = new Error().stack.toString();\n      msg({\n        verb: 'signal.abort',\n        args: ['abort', 'exit(' + code + ')', callstack, null],\n      });\n    },\n  };\n};\n\n// Get the memory to be used by wasm. (Only used in multi-thread mode)\n// Because we have a weird OOM issue on iOS, we need to try some values\n// See: https://github.com/emscripten-core/emscripten/issues/19144\n//      https://github.com/godotengine/godot/issues/70621\nconst getWasmMemory = () => {\n  let minBytes = 128 * 1024 * 1024;\n  let maxBytes = 4096 * 1024 * 1024;\n  let stepBytes = 128 * 1024 * 1024;\n  while (maxBytes > minBytes) {\n    try {\n      const wasmMemory = new WebAssembly.Memory({\n        initial: toSizeT(minBytes / 65536),\n        maximum: toSizeT(maxBytes / 65536),\n        shared: true,\n        address: isCompat ? undefined : 'i64',\n      });\n      return wasmMemory;\n    } catch (e) {\n      maxBytes -= stepBytes;\n      continue; // retry\n    }\n  }\n  throw new Error('Cannot allocate WebAssembly.Memory');\n};\n\n//////////////////////////////////////////////////////////////\n// HEAPFS PATCH\n//////////////////////////////////////////////////////////////\n\n/**\n * By default, emscripten uses memfs. The way it works is by\n * allocating new Uint8Array in javascript heap. This is not good\n * because it requires files to be copied to wasm heap each time\n * a file is read.\n *\n * HeapFS is an alternative, which resolves this problem by\n * allocating space for file directly inside wasm heap. This\n * allows us to mmap without doing any copy.\n *\n * For llama.cpp, this is great because we use MAP_SHARED\n *\n * Ref: https://github.com/ngxson/wllama/pull/39\n * Ref: https://github.com/emscripten-core/emscripten/blob/main/src/library_memfs.js\n *\n * Note 29/05/2024 @ngxson\n * Due to ftell() being limited to MAX_LONG, we cannot load files bigger than 2^31 bytes (or 2GB)\n * Ref: https://github.com/emscripten-core/emscripten/blob/main/system/lib/libc/musl/src/stdio/ftell.c\n */\n\nconst fsNameToFile = {}; // map Name => File\nconst fsIdToFile = {}; // map ID => File\nlet currFileId = 0;\n\n// Patch and redirect memfs calls to wllama\nconst patchHeapFS = () => {\n  const m = Module;\n  // save functions\n  m.MEMFS.stream_ops._read = m.MEMFS.stream_ops.read;\n  m.MEMFS.stream_ops._write = m.MEMFS.stream_ops.write;\n  m.MEMFS.stream_ops._llseek = m.MEMFS.stream_ops.llseek;\n  m.MEMFS.stream_ops._allocate = m.MEMFS.stream_ops.allocate;\n  m.MEMFS.stream_ops._mmap = m.MEMFS.stream_ops.mmap;\n  m.MEMFS.stream_ops._msync = m.MEMFS.stream_ops.msync;\n\n  const patchStream = (stream) => {\n    const name = stream.node.name;\n    if (fsNameToFile[name]) {\n      const f = fsNameToFile[name];\n      const ptr = Number(f.ptr);\n      stream.node.contents = getHeapU8().subarray(ptr, ptr + f.size);\n      stream.node.usedBytes = f.size;\n    }\n  };\n\n  // replace \"read\" functions\n  m.MEMFS.stream_ops.read = function (\n    stream,\n    buffer,\n    offset,\n    length,\n    position\n  ) {\n    patchStream(stream);\n    return m.MEMFS.stream_ops._read(stream, buffer, offset, length, position);\n  };\n  m.MEMFS.ops_table.file.stream.read = m.MEMFS.stream_ops.read;\n\n  // replace \"llseek\" functions\n  m.MEMFS.stream_ops.llseek = function (stream, offset, whence) {\n    patchStream(stream);\n    return m.MEMFS.stream_ops._llseek(stream, offset, whence);\n  };\n  m.MEMFS.ops_table.file.stream.llseek = m.MEMFS.stream_ops.llseek;\n\n  // replace \"mmap\" functions\n  m.MEMFS.stream_ops.mmap = function (stream, length, position, prot, flags) {\n    patchStream(stream);\n    const name = stream.node.name;\n    if (fsNameToFile[name]) {\n      const f = fsNameToFile[name];\n      const mmapPtr = f.ptr + toSizeT(position);\n      return {\n        ptr: mmapPtr,\n        allocated: false,\n      };\n    } else {\n      return m.MEMFS.stream_ops._mmap(stream, length, position, prot, flags);\n    }\n  };\n  m.MEMFS.ops_table.file.stream.mmap = m.MEMFS.stream_ops.mmap;\n\n  // mount FS\n  m.FS.mkdir('/models');\n  m.FS.mount(m.MEMFS, { root: '.' }, '/models');\n};\n\n// Allocate a new file in wllama heapfs, returns file ID\nconst heapfsAlloc = (name, size, allocBuffer) => {\n  if (size < 1) {\n    throw new Error('File size must be bigger than 0');\n  }\n  const m = Module;\n  const ptr = toSizeT(allocBuffer ? m.mmapAlloc(size) : 0);\n  const file = {\n    ptr: ptr,\n    size: size,\n    id: currFileId++,\n  };\n  fsIdToFile[file.id] = file;\n  fsNameToFile[name] = file;\n  return file.id;\n};\n\n// Add new file to wllama heapfs, return number of written bytes\nconst heapfsWrite = (id, buffer, offset) => {\n  if (fsIdToFile[id]) {\n    const { ptr, size } = fsIdToFile[id];\n    const afterWriteByte = offset + buffer.byteLength;\n    if (afterWriteByte > size) {\n      throw new Error(\n        `File ID ${id} write out of bound, afterWriteByte = ${afterWriteByte} while size = ${size}`\n      );\n    }\n    getHeapU8().set(buffer, Number(ptr) + offset);\n    return buffer.byteLength;\n  } else {\n    throw new Error(`File ID ${id} not found in heapfs`);\n  }\n};\n\n//////////////////////////////////////////////////////////////\n// ASYNC FILE READ\n//////////////////////////////////////////////////////////////\n\nlet isAwaitReading = false;\nlet pendingReadPromise = null;\nlet pendingReadResolve = null;\nlet pendingReadReject = null;\n\nconst _stripModelsPrefix = (path) => path.replace(/^\\/?models\\//, '');\n\n// Called from EM_ASYNC_JS stub in wllama-fs.h (path is already a JS string)\nconst _wllama_js_file_read = async (path, offset, req_size, out_ptr) => {\n  const name = _stripModelsPrefix(path);\n\n  pendingReadPromise = new Promise((res, rej) => {\n    pendingReadResolve = res;\n    pendingReadReject = rej;\n  });\n  isAwaitReading = true;\n\n  postMessage({ verb: 'fs.read_req', args: [name, offset, req_size] });\n\n  let data;\n  try {\n    data = await pendingReadPromise;\n  } finally {\n    isAwaitReading = false;\n    pendingReadResolve = null;\n    pendingReadReject = null;\n  }\n\n  const bytes = new Uint8Array(data);\n  getHeapU8().set(bytes, out_ptr);\n  return toSizeT(bytes.length);\n};\n\n//////////////////////////////////////////////////////////////\n// MAIN CODE\n//////////////////////////////////////////////////////////////\n\nconst callWrapper = (name, ret, args, isAsync) => {\n  const fn = Module.cwrap(\n    name,\n    ret,\n    args,\n    isAsync ? { async: true } : undefined\n  );\n  return async (action, req) => {\n    // console.log(`Calling ${name} with action:`, action, 'and req:', req);\n    let result;\n    try {\n      if (args.length === 2) {\n        result = isAsync ? await fn(action, req) : fn(action, req);\n      } else {\n        result = fn();\n      }\n    } catch (ex) {\n      console.error(ex);\n      throw ex;\n    }\n    return result;\n  };\n};\n\nfunction handleError(err) {\n  // If WASM already aborted, onAbort already sent signal.abort; skip to avoid\n  // re-reporting the resulting WebAssembly.RuntimeError as a JS exception.\n  if (isAborted) return;\n\n  const message = err ? err.message || String(err) : 'Unknown error';\n  const stack = err ? err.stack || String(err) : '';\n  msg({\n    verb: 'signal.abort',\n    args: ['exception', message, stack, err],\n  });\n}\n\nonmessage = async (e) => {\n  if (!e.data) return;\n  const { verb, args, callbackId } = e.data;\n\n  // fs.read_res arrives while wasm is JSPI-suspended; resolve the pending promise.\n  if (verb === 'fs.read_res') {\n    if (pendingReadResolve) {\n      pendingReadResolve(args[0]);\n    }\n    return;\n  }\n\n  // Guard: while awaiting a file read, reject any other incoming task.\n  if (isAwaitReading) {\n    if (callbackId) {\n      msg({\n        callbackId,\n        err: 'Worker is suspended waiting for file data (JSPI)',\n      });\n    }\n    return;\n  }\n\n  if (!callbackId) {\n    msg({ verb: 'console.error', args: ['callbackId is required', e.data] });\n    return;\n  }\n\n  if (verb === 'module.init') {\n    const argMainScriptBlob = args[0];\n    const argUseAsyncFile = args[1];\n    try {\n      Module = getWModuleConfig(argMainScriptBlob);\n      Module.preRun = () => {\n        if (argUseAsyncFile) {\n          Module.ENV['USE_ASYNC_FILE'] = '1';\n        }\n      };\n      Module.onRuntimeInitialized = () => {\n        // async call once module is ready\n        // init FS\n        patchHeapFS();\n        // init cwrap\n        const pointer = isCompat ? 'number' : 'bigint';\n        // TODO: note sure why emscripten cannot bind if there is only 1 argument\n        wllamaMalloc = callWrapper('wllama_malloc', pointer, [\n          'number',\n          pointer,\n        ]);\n        wllamaStart = callWrapper('wllama_start', 'string', [], true);\n        wllamaAction = callWrapper(\n          'wllama_action',\n          pointer,\n          ['string', pointer],\n          true\n        );\n        wllamaExit = callWrapper('wllama_exit', 'string', []);\n        wllamaDebug = callWrapper('wllama_debug', 'string', []);\n        msg({ callbackId, result: null });\n      };\n      wModuleInit();\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'fs.alloc') {\n    const argFilename = args[0];\n    const argSize = args[1];\n    const argAllocBuffer = args[2];\n    try {\n      // create blank file\n      const emptyBuffer = new ArrayBuffer(0);\n      Module['FS_createDataFile'](\n        '/models',\n        argFilename,\n        emptyBuffer,\n        true,\n        true,\n        true\n      );\n      // alloc data on heap\n      const fileId = heapfsAlloc(argFilename, argSize, argAllocBuffer);\n      msg({ callbackId, result: { fileId } });\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'fs.write') {\n    const argFileId = args[0];\n    const argBuffer = args[1];\n    const argOffset = args[2];\n    try {\n      const writtenBytes = heapfsWrite(argFileId, argBuffer, argOffset);\n      msg({ callbackId, result: { writtenBytes } });\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'wllama.start') {\n    try {\n      const result = await wllamaStart();\n      msg({ callbackId, result });\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'wllama.action') {\n    const argAction = args[0];\n    const argEncodedMsg = args[1];\n    try {\n      const inputPtr = await wllamaMalloc(toSizeT(argEncodedMsg.byteLength), 0);\n      // copy data to wasm heap\n      const inputBuffer = new Uint8Array(\n        getHeapU8().buffer,\n        Number(inputPtr),\n        argEncodedMsg.byteLength\n      );\n      inputBuffer.set(argEncodedMsg, 0);\n      const outputPtr = await wllamaAction(argAction, inputPtr);\n      // length of output buffer is written at the first 4 bytes of input buffer\n      const outputLen = new Uint32Array(\n        getHeapU8().buffer,\n        Number(inputPtr),\n        1\n      )[0];\n      // copy the output buffer to JS heap\n      const outputBuffer = new Uint8Array(outputLen);\n      const outputSrcView = new Uint8Array(\n        getHeapU8().buffer,\n        Number(outputPtr),\n        outputLen\n      );\n      outputBuffer.set(outputSrcView, 0); // copy it\n      msg({ callbackId, result: outputBuffer }, [outputBuffer.buffer]);\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'wllama.exit') {\n    try {\n      const result = await wllamaExit();\n      msg({ callbackId, result });\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'wllama.debug') {\n    try {\n      const result = await wllamaDebug();\n      msg({ callbackId, result });\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n};\n";
var OPFS_UTILS_WORKER_CODE = "let accessHandle;\nlet abortController = new AbortController();\n\nasync function openFile(filename) {\n  const opfsRoot = await navigator.storage.getDirectory();\n  const cacheDir = await opfsRoot.getDirectoryHandle('cache', { create: true });\n  const fileHandler = await cacheDir.getFileHandle(filename, { create: true });\n  accessHandle = await fileHandler.createSyncAccessHandle();\n  accessHandle.truncate(0); // clear file content\n}\n\nasync function writeFile(buf) {\n  accessHandle.write(buf);\n}\n\nasync function closeFile() {\n  accessHandle.flush();\n  accessHandle.close();\n}\n\nasync function writeTextFile(filename, str) {\n  await openFile(filename);\n  await writeFile(new TextEncoder().encode(str));\n  await closeFile();\n}\n\nconst throttled = (func, delay) => {\n  let lastRun = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - lastRun > delay) {\n      lastRun = now;\n      func.apply(null, args);\n    }\n  };\n};\n\nconst assertNonNull = (val) => {\n  if (val === null || val === undefined) {\n    throw new Error('OPFS Worker: Assertion failed');\n  }\n};\n\n// respond to main thread\nconst resOK = () => postMessage({ ok: true });\nconst resProgress = (loaded, total) =>\n  postMessage({ progress: { loaded, total } });\nconst resErr = (err) => postMessage({ err });\n\nonmessage = async (e) => {\n  try {\n    if (!e.data) return;\n\n    /**\n     * @param {Object} e.data\n     *\n     * Fine-control FS actions:\n     * - { action: 'open', filename: 'string' }\n     * - { action: 'write', buf: ArrayBuffer }\n     * - { action: 'close' }\n     *\n     * Simple write API:\n     * - { action: 'write-simple', filename: 'string', buf: ArrayBuffer }\n     *\n     * Download API:\n     * - { action: 'download', url: 'string', filename: 'string', options: Object, metadataFileName: 'string' }\n     * - { action: 'download-abort' }\n     */\n    const {\n      action,\n      filename,\n      buf,\n      url,\n      options,\n      metadataFileName,\n      metadataAdditional,\n    } = e.data;\n\n    if (action === 'open') {\n      assertNonNull(filename);\n      await openFile(filename);\n      return resOK();\n    } else if (action === 'write') {\n      assertNonNull(buf);\n      await writeFile(buf);\n      return resOK();\n    } else if (action === 'close') {\n      await closeFile();\n      return resOK();\n    } else if (action === 'write-simple') {\n      assertNonNull(filename);\n      assertNonNull(buf);\n      await openFile(filename);\n      await writeFile(buf);\n      await closeFile();\n      return resOK();\n    } else if (action === 'download') {\n      assertNonNull(url);\n      assertNonNull(filename);\n      assertNonNull(metadataFileName);\n      assertNonNull(options);\n      assertNonNull(options.aborted);\n      abortController = new AbortController();\n      if (options.aborted) abortController.abort();\n      const response = await fetch(url, {\n        ...options,\n        signal: abortController.signal,\n      });\n      const contentLength = response.headers.get('content-length');\n      const etag = (response.headers.get('etag') || '').replace(\n        /[^A-Za-z0-9]/g,\n        ''\n      );\n      const total = parseInt(contentLength, 10);\n      const reader = response.body.getReader();\n      await openFile(filename);\n      let loaded = 0;\n      const throttledProgress = throttled(resProgress, 100);\n      while (true) {\n        const { done, value } = await reader.read();\n        if (done) break;\n        loaded += value.byteLength;\n        await writeFile(value);\n        throttledProgress(loaded, total);\n      }\n      resProgress(total, total); // 100% done\n      await closeFile();\n      // make sure this is in-sync with CacheEntryMetadata\n      await writeTextFile(\n        metadataFileName,\n        JSON.stringify({\n          originalURL: url,\n          originalSize: total,\n          etag,\n          ...metadataAdditional,\n        })\n      );\n      return resOK();\n    } else if (action === 'download-abort') {\n      if (abortController) {\n        abortController.abort();\n      }\n      return;\n    }\n\n    throw new Error('OPFS Worker: Invalid action', e.data);\n  } catch (err) {\n    return resErr(err);\n  }\n};\n";
var WLLAMA_EMSCRIPTEN_CODE = 'var Module=typeof Module!="undefined"?Module:{};var ENVIRONMENT_IS_WEB=!!globalThis.window;var ENVIRONMENT_IS_WORKER=!!globalThis.WorkerGlobalScope;var ENVIRONMENT_IS_NODE=globalThis.process?.versions?.node&&globalThis.process?.type!="renderer";var ENVIRONMENT_IS_PTHREAD=ENVIRONMENT_IS_WORKER&&self.name?.startsWith("em-pthread");if(ENVIRONMENT_IS_NODE){var worker_threads=require("worker_threads");global.Worker=worker_threads.Worker;ENVIRONMENT_IS_WORKER=!worker_threads.isMainThread;ENVIRONMENT_IS_PTHREAD=ENVIRONMENT_IS_WORKER&&worker_threads["workerData"]=="em-pthread"}var arguments_=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var _scriptName=globalThis.document?.currentScript?.src;if(typeof __filename!="undefined"){_scriptName=__filename}else if(ENVIRONMENT_IS_WORKER){_scriptName=self.location.href}var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var readAsync,readBinary;if(ENVIRONMENT_IS_NODE){var fs=require("fs");scriptDirectory=__dirname+"/";readBinary=filename=>{filename=isFileURI(filename)?new URL(filename):filename;var ret=fs.readFileSync(filename);return ret};readAsync=async(filename,binary=true)=>{filename=isFileURI(filename)?new URL(filename):filename;var ret=fs.readFileSync(filename,binary?undefined:"utf8");return ret};if(process.argv.length>1){thisProgram=process.argv[1].replace(/\\\\/g,"/")}arguments_=process.argv.slice(2);if(typeof module!="undefined"){module["exports"]=Module}quit_=(status,toThrow)=>{process.exitCode=status;throw toThrow}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){try{scriptDirectory=new URL(".",_scriptName).href}catch{}if(!ENVIRONMENT_IS_NODE){if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=async url=>{if(isFileURI(url)){return new Promise((resolve,reject)=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){resolve(xhr.response);return}reject(xhr.status)};xhr.onerror=reject;xhr.send(null)})}var response=await fetch(url,{credentials:"same-origin"});if(response.ok){return response.arrayBuffer()}throw new Error(response.status+" : "+response.url)}}}else{}var defaultPrint=console.log.bind(console);var defaultPrintErr=console.error.bind(console);if(ENVIRONMENT_IS_NODE){var utils=require("util");var stringify=a=>typeof a=="object"?utils.inspect(a):a;defaultPrint=(...args)=>fs.writeSync(1,args.map(stringify).join(" ")+"\\n");defaultPrintErr=(...args)=>fs.writeSync(2,args.map(stringify).join(" ")+"\\n")}var out=defaultPrint;var err=defaultPrintErr;var wasmBinary;var wasmModule;var ABORT=false;var EXITSTATUS;function assert(condition,text){if(!condition){abort(text)}}var isFileURI=filename=>filename.startsWith("file://");function growMemViews(){if(wasmMemory.buffer!=HEAP8.buffer){updateMemoryViews()}}if(ENVIRONMENT_IS_NODE&&ENVIRONMENT_IS_PTHREAD){var parentPort=worker_threads["parentPort"];parentPort.on("message",msg=>global.onmessage?.({data:msg}));Object.assign(globalThis,{self:global,postMessage:msg=>parentPort["postMessage"](msg)});process.on("uncaughtException",err=>{postMessage({cmd:"uncaughtException",error:err});process.exit(1)})}var startWorker;if(ENVIRONMENT_IS_PTHREAD){var initializedJS=false;self.onunhandledrejection=e=>{throw e.reason||e};async function handleMessage(e){try{var msgData=e["data"];var cmd=msgData.cmd;if(cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);startWorker=()=>{postMessage({cmd:"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};for(const handler of msgData.handlers){if(!Module[handler]||Module[handler].proxy){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler,args})};if(handler=="print")out=Module[handler];if(handler=="printErr")err=Module[handler]}}wasmMemory=msgData.wasmMemory;updateMemoryViews();wasmModule=msgData.wasmModule;createWasm();run()}else if(cmd==="run"){establishStackSpace(msgData.pthread_ptr);__emscripten_thread_init(msgData.pthread_ptr,0,0,1,0,0);PThread.threadInitTLS();__emscripten_thread_mailbox_await(msgData.pthread_ptr);if(!initializedJS){initializedJS=true}try{await invokeEntryPoint(msgData.start_routine,msgData.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(msgData.target==="setimmediate"){}else if(cmd==="checkMailbox"){if(initializedJS){checkMailbox()}}else if(cmd){err(`worker: received unknown command ${cmd}`);err(msgData)}}catch(ex){__emscripten_thread_crashed();throw ex}}self.onmessage=handleMessage}var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;var HEAP64,HEAPU64;var runtimeInitialized=false;function updateMemoryViews(){var b=wasmMemory.buffer;HEAP8=new Int8Array(b);HEAP16=new Int16Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);HEAPU16=new Uint16Array(b);HEAP32=new Int32Array(b);HEAPU32=new Uint32Array(b);HEAPF32=new Float32Array(b);HEAPF64=new Float64Array(b);HEAP64=new BigInt64Array(b);HEAPU64=new BigUint64Array(b)}function initMemory(){if(ENVIRONMENT_IS_PTHREAD){return}if(Module["wasmMemory"]){wasmMemory=Module["wasmMemory"]}else{var INITIAL_MEMORY=Module["INITIAL_MEMORY"]||134217728;wasmMemory=new WebAssembly.Memory({initial:BigInt(INITIAL_MEMORY/65536),maximum:65536n,shared:true,address:"i64"})}updateMemoryViews()}function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(onPreRuns)}function initRuntime(){runtimeInitialized=true;if(ENVIRONMENT_IS_PTHREAD)return startWorker();if(!Module["noFSInit"]&&!FS.initialized)FS.init();TTY.init();wasmExports["__wasm_call_ctors"]();FS.ignorePermissions=false}function preMain(){}function postRun(){if(ENVIRONMENT_IS_PTHREAD){return}if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(onPostRuns)}function abort(what){Module["onAbort"]?.(what);what="Aborted("+what+")";err(what);ABORT=true;what+=". Build with -sASSERTIONS for more info.";if(runtimeInitialized){___trap()}var e=new WebAssembly.RuntimeError(what);throw e}var wasmBinaryFile;function findWasmBinary(){return locateFile("wllama.wasm")}function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw"both async and sync fetching of the wasm failed"}async function getWasmBinary(binaryFile){if(!wasmBinary){try{var response=await readAsync(binaryFile);return new Uint8Array(response)}catch{}}return getBinarySync(binaryFile)}async function instantiateArrayBuffer(binaryFile,imports){try{var binary=await getWasmBinary(binaryFile);var instance=await WebAssembly.instantiate(binary,imports);return instance}catch(reason){err(`failed to asynchronously prepare wasm: ${reason}`);abort(reason)}}async function instantiateAsync(binary,binaryFile,imports){if(!binary&&!isFileURI(binaryFile)&&!ENVIRONMENT_IS_NODE){try{var response=fetch(binaryFile,{credentials:"same-origin"});var instantiationResult=await WebAssembly.instantiateStreaming(response,imports);return instantiationResult}catch(reason){err(`wasm streaming compile failed: ${reason}`);err("falling back to ArrayBuffer instantiation")}}return instantiateArrayBuffer(binaryFile,imports)}function getWasmImports(){assignWasmImports();if(!wasmImports.__instrumented){wasmImports.__instrumented=true;Asyncify.instrumentWasmImports(wasmImports)}var imports={env:wasmImports,wasi_snapshot_preview1:wasmImports};return imports}async function createWasm(){function receiveInstance(instance,module){wasmExports=instance.exports;wasmExports=Asyncify.instrumentWasmExports(wasmExports);wasmExports=applySignatureConversions(wasmExports);registerTLSInit(wasmExports["_emscripten_tls_init"]);assignWasmExports(wasmExports);wasmModule=module;removeRunDependency("wasm-instantiate");return wasmExports}addRunDependency("wasm-instantiate");function receiveInstantiationResult(result){return receiveInstance(result["instance"],result["module"])}var info=getWasmImports();if(Module["instantiateWasm"]){return new Promise((resolve,reject)=>{Module["instantiateWasm"](info,(inst,mod)=>{resolve(receiveInstance(inst,mod))})})}if(ENVIRONMENT_IS_PTHREAD){var instance=new WebAssembly.Instance(wasmModule,getWasmImports());return receiveInstance(instance,wasmModule)}wasmBinaryFile??=findWasmBinary();var result=await instantiateAsync(wasmBinary,wasmBinaryFile,info);var exports=receiveInstantiationResult(result);return exports}class ExitStatus{name="ExitStatus";constructor(status){this.message=`Program terminated with exit(${status})`;this.status=status}}var terminateWorker=worker=>{worker.terminate();worker.onmessage=e=>{}};var cleanupThread=pthread_ptr=>{var worker=PThread.pthreads[pthread_ptr];PThread.returnWorkerToPool(worker)};var callRuntimeCallbacks=callbacks=>{while(callbacks.length>0){callbacks.shift()(Module)}};var onPreRuns=[];var addOnPreRun=cb=>onPreRuns.push(cb);var runDependencies=0;var dependenciesFulfilled=null;var removeRunDependency=id=>{runDependencies--;Module["monitorRunDependencies"]?.(runDependencies);if(runDependencies==0){if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}};var addRunDependency=id=>{runDependencies++;Module["monitorRunDependencies"]?.(runDependencies)};var spawnThread=threadParams=>{var worker=PThread.getNewWorker();if(!worker){return 6}PThread.runningWorkers.push(worker);PThread.pthreads[threadParams.pthread_ptr]=worker;worker.pthread_ptr=threadParams.pthread_ptr;var msg={cmd:"run",start_routine:threadParams.startRoutine,arg:threadParams.arg,pthread_ptr:threadParams.pthread_ptr};if(ENVIRONMENT_IS_NODE){worker.unref()}worker.postMessage(msg,threadParams.transferList);return 0};var runtimeKeepaliveCounter=0;var keepRuntimeAlive=()=>noExitRuntime||runtimeKeepaliveCounter>0;var stackSave=()=>_emscripten_stack_get_current();var stackRestore=val=>__emscripten_stack_restore(val);var stackAlloc=sz=>__emscripten_stack_alloc(sz);var proxyToMainThread=(funcIndex,emAsmAddr,sync,...callArgs)=>{var serializedNumCallArgs=callArgs.length*2;var sp=stackSave();var args=stackAlloc(serializedNumCallArgs*8);var b=args/8;for(var i=0;i<callArgs.length;i++){var arg=callArgs[i];if(typeof arg=="bigint"){(growMemViews(),HEAP64)[b+2*i]=1n;(growMemViews(),HEAP64)[b+2*i+1]=arg}else{(growMemViews(),HEAP64)[b+2*i]=0n;(growMemViews(),HEAPF64)[b+2*i+1]=arg}}var rtn=__emscripten_run_js_on_main_thread(funcIndex,emAsmAddr,serializedNumCallArgs,args,sync);stackRestore(sp);return rtn};function _proc_exit(code){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(0,0,1,code);EXITSTATUS=code;if(!keepRuntimeAlive()){PThread.terminateAllThreads();Module["onExit"]?.(code);ABORT=true}quit_(code,new ExitStatus(code))}function exitOnMainThread(returnCode){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(1,0,0,returnCode);_exit(returnCode)}var exitJS=(status,implicit)=>{EXITSTATUS=status;if(ENVIRONMENT_IS_PTHREAD){exitOnMainThread(status);throw"unwind"}_proc_exit(status)};var _exit=exitJS;var PThread={unusedWorkers:[],runningWorkers:[],tlsInitFunctions:[],pthreads:{},init(){if(!ENVIRONMENT_IS_PTHREAD){PThread.initMainThread()}},initMainThread(){var pthreadPoolSize=Module["pthreadPoolSize"];while(pthreadPoolSize--){PThread.allocateUnusedWorker()}addOnPreRun(async()=>{var pthreadPoolReady=PThread.loadWasmModuleToAllWorkers();addRunDependency("loading-workers");await pthreadPoolReady;removeRunDependency("loading-workers")})},terminateAllThreads:()=>{for(var worker of PThread.runningWorkers){terminateWorker(worker)}for(var worker of PThread.unusedWorkers){terminateWorker(worker)}PThread.unusedWorkers=[];PThread.runningWorkers=[];PThread.pthreads={}},returnWorkerToPool:worker=>{var pthread_ptr=worker.pthread_ptr;delete PThread.pthreads[pthread_ptr];PThread.unusedWorkers.push(worker);PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker),1);worker.pthread_ptr=0;__emscripten_thread_free_data(pthread_ptr)},threadInitTLS(){PThread.tlsInitFunctions.forEach(f=>f())},loadWasmModuleToWorker:worker=>new Promise(onFinishedLoading=>{worker.onmessage=e=>{var d=e["data"];var cmd=d.cmd;if(d.targetThread&&d.targetThread!=_pthread_self()){var targetWorker=PThread.pthreads[d.targetThread];if(targetWorker){targetWorker.postMessage(d,d.transferList)}else{err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d.targetThread}, but that thread no longer exists!`)}return}if(cmd==="checkMailbox"){checkMailbox()}else if(cmd==="spawnThread"){spawnThread(d)}else if(cmd==="cleanupThread"){callUserCallback(()=>cleanupThread(d.thread))}else if(cmd==="loaded"){worker.loaded=true;if(ENVIRONMENT_IS_NODE&&!worker.pthread_ptr){worker.unref()}onFinishedLoading(worker)}else if(d.target==="setimmediate"){worker.postMessage(d)}else if(cmd==="uncaughtException"){worker.onerror(d.error)}else if(cmd==="callHandler"){Module[d.handler](...d.args)}else if(cmd){err(`worker sent an unknown command ${cmd}`)}};worker.onerror=e=>{var message="worker sent an error!";err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);throw e};if(ENVIRONMENT_IS_NODE){worker.on("message",data=>worker.onmessage({data}));worker.on("error",e=>worker.onerror(e))}var handlers=[];var knownHandlers=["onExit","onAbort","print","printErr"];for(var handler of knownHandlers){if(Module.propertyIsEnumerable(handler)){handlers.push(handler)}}worker.postMessage({cmd:"load",handlers,wasmMemory,wasmModule})}),async loadWasmModuleToAllWorkers(){if(ENVIRONMENT_IS_PTHREAD){return}let pthreadPoolReady=Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));return pthreadPoolReady},allocateUnusedWorker(){var worker;var pthreadMainJs=_scriptName;if(Module["mainScriptUrlOrBlob"]){pthreadMainJs=Module["mainScriptUrlOrBlob"];if(typeof pthreadMainJs!="string"){pthreadMainJs=URL.createObjectURL(pthreadMainJs)}}worker=new Worker(pthreadMainJs,{workerData:"em-pthread",name:"em-pthread"});PThread.unusedWorkers.push(worker)},getNewWorker(){if(PThread.unusedWorkers.length==0){PThread.allocateUnusedWorker();PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0])}return PThread.unusedWorkers.pop()}};var onPostRuns=[];var addOnPostRun=cb=>onPostRuns.push(cb);function establishStackSpace(pthread_ptr){var stackHigh=Number((growMemViews(),HEAPU64)[(pthread_ptr+88)/8]);var stackSize=Number((growMemViews(),HEAPU64)[(pthread_ptr+96)/8]);var stackLow=stackHigh-stackSize;_emscripten_stack_set_limits(stackHigh,stackLow);stackRestore(stackHigh)}var wasmTableMirror=[];var getWasmTableEntry=funcPtr=>{funcPtr=Number(funcPtr);var func=wasmTableMirror[funcPtr];if(!func){wasmTableMirror[funcPtr]=func=wasmTable.get(BigInt(funcPtr));if(Asyncify.isAsyncExport(func)){wasmTableMirror[funcPtr]=func=Asyncify.makeAsyncFunction(func)}}return func};var invokeEntryPoint=async(ptr,arg)=>{runtimeKeepaliveCounter=0;noExitRuntime=0;var result=(a1=>WebAssembly.promising(getWasmTableEntry(ptr)).call(null,BigInt(a1)))(arg);function finish(result){if(keepRuntimeAlive()){EXITSTATUS=result;return}__emscripten_thread_exit(result)}result=await result;finish(result)};invokeEntryPoint.isAsync=true;var noExitRuntime=true;var registerTLSInit=tlsInitFunc=>PThread.tlsInitFunctions.push(tlsInitFunc);var wasmMemory;function pthreadCreateProxied(pthread_ptr,attr,startRoutine,arg){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(2,0,1,pthread_ptr,attr,startRoutine,arg);return ___pthread_create_js(pthread_ptr,attr,startRoutine,arg)}var _emscripten_has_threading_support=()=>!!globalThis.SharedArrayBuffer;var INT53_MAX=9007199254740992;var INT53_MIN=-9007199254740992;var bigintToI53Checked=num=>num<INT53_MIN||num>INT53_MAX?NaN:Number(num);function ___pthread_create_js(pthread_ptr,attr,startRoutine,arg){pthread_ptr=bigintToI53Checked(pthread_ptr);attr=bigintToI53Checked(attr);startRoutine=bigintToI53Checked(startRoutine);arg=bigintToI53Checked(arg);if(!_emscripten_has_threading_support()){return 6}var transferList=[];var error=0;if(ENVIRONMENT_IS_PTHREAD&&(transferList.length===0||error)){return pthreadCreateProxied(pthread_ptr,attr,startRoutine,arg)}if(error)return error;var threadParams={startRoutine,pthread_ptr,arg,transferList};if(ENVIRONMENT_IS_PTHREAD){threadParams.cmd="spawnThread";postMessage(threadParams,transferList);return 0}return spawnThread(threadParams)}var syscallGetVarargP=()=>{var ret=Number((growMemViews(),HEAPU64)[SYSCALLS.varargs/8]);SYSCALLS.varargs+=8;return ret};var syscallGetVarargI=()=>{var ret=(growMemViews(),HEAP32)[+SYSCALLS.varargs/4];SYSCALLS.varargs+=4;return ret};var PATH={isAbs:path=>path.charAt(0)==="/",splitPath:filename=>{var splitPathRe=/^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$/;return splitPathRe.exec(filename).slice(1)},normalizeArray:(parts,allowAboveRoot)=>{var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up;up--){parts.unshift("..")}}return parts},normalize:path=>{var isAbsolute=PATH.isAbs(path),trailingSlash=path.slice(-1)==="/";path=PATH.normalizeArray(path.split("/").filter(p=>!!p),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path},dirname:path=>{var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.slice(0,-1)}return root+dir},basename:path=>path&&path.match(/([^\\/]+|\\/)\\/*$/)[1],join:(...paths)=>PATH.normalize(paths.join("/")),join2:(l,r)=>PATH.normalize(l+"/"+r)};var initRandomFill=()=>view=>view.set(crypto.getRandomValues(new Uint8Array(view.byteLength)));var randomFill=view=>{(randomFill=initRandomFill())(view)};var PATH_FS={resolve:(...args)=>{var resolvedPath="",resolvedAbsolute=false;for(var i=args.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?args[i]:FS.cwd();if(typeof path!="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=PATH.isAbs(path)}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter(p=>!!p),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."},relative:(from,to)=>{from=PATH_FS.resolve(from).slice(1);to=PATH_FS.resolve(to).slice(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")}};var UTF8Decoder=globalThis.TextDecoder&&new TextDecoder;var findStringEnd=(heapOrArray,idx,maxBytesToRead,ignoreNul)=>{var maxIdx=idx+maxBytesToRead;if(ignoreNul)return maxIdx;while(heapOrArray[idx]&&!(idx>=maxIdx))++idx;return idx};var UTF8ArrayToString=(heapOrArray,idx=0,maxBytesToRead,ignoreNul)=>{var endPtr=findStringEnd(heapOrArray,idx,maxBytesToRead,ignoreNul);if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.buffer instanceof ArrayBuffer?heapOrArray.subarray(idx,endPtr):heapOrArray.slice(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}return str};var FS_stdin_getChar_buffer=[];var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++}else if(c<=2047){len+=2}else if(c>=55296&&c<=57343){len+=4;++i}else{len+=3}}return len};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.codePointAt(i);if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63;i++}}heap[outIdx]=0;return outIdx-startIdx};var intArrayFromString=(stringy,dontAddNull,length)=>{var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array};var FS_stdin_getChar=()=>{if(!FS_stdin_getChar_buffer.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=Buffer.alloc(BUFSIZE);var bytesRead=0;var fd=process.stdin.fd;try{bytesRead=fs.readSync(fd,buf,0,BUFSIZE)}catch(e){if(e.toString().includes("EOF"))bytesRead=0;else throw e}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8")}}else if(globalThis.window?.prompt){result=window.prompt("Input: ");if(result!==null){result+="\\n"}}else{}if(!result){return null}FS_stdin_getChar_buffer=intArrayFromString(result,true)}return FS_stdin_getChar_buffer.shift()};var TTY={ttys:[],init(){},shutdown(){},register(dev,ops){TTY.ttys[dev]={input:[],output:[],ops};FS.registerDevice(dev,TTY.stream_ops)},stream_ops:{open(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(43)}stream.tty=tty;stream.seekable=false},close(stream){stream.tty.ops.fsync(stream.tty)},fsync(stream){stream.tty.ops.fsync(stream.tty)},read(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(60)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.atime=Date.now()}return bytesRead},write(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(60)}try{for(var i=0;i<length;i++){stream.tty.ops.put_char(stream.tty,buffer[offset+i])}}catch(e){throw new FS.ErrnoError(29)}if(length){stream.node.mtime=stream.node.ctime=Date.now()}return i}},default_tty_ops:{get_char(tty){return FS_stdin_getChar()},put_char(tty,val){if(val===null||val===10){out(UTF8ArrayToString(tty.output));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync(tty){if(tty.output?.length>0){out(UTF8ArrayToString(tty.output));tty.output=[]}},ioctl_tcgets(tty){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(tty,optional_actions,data){return 0},ioctl_tiocgwinsz(tty){return[24,80]}},default_tty1_ops:{put_char(tty,val){if(val===null||val===10){err(UTF8ArrayToString(tty.output));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync(tty){if(tty.output?.length>0){err(UTF8ArrayToString(tty.output));tty.output=[]}}}};var zeroMemory=(ptr,size)=>(growMemViews(),HEAPU8).fill(0,ptr,ptr+size);var alignMemory=(size,alignment)=>Math.ceil(size/alignment)*alignment;var mmapAlloc=size=>{size=alignMemory(size,65536);var ptr=_emscripten_builtin_memalign(65536,size);if(ptr)zeroMemory(ptr,size);return ptr};var MEMFS={ops_table:null,mount(mount){return MEMFS.createNode(null,"/",16895,0)},createNode(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(63)}MEMFS.ops_table||={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}};var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.atime=node.mtime=node.ctime=Date.now();if(parent){parent.contents[name]=node;parent.atime=parent.mtime=parent.ctime=node.atime}return node},getFileDataAsTypedArray(node){if(!node.contents)return new Uint8Array(0);if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)},expandFileStorage(node,newCapacity){var prevCapacity=node.contents?node.contents.length:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)>>>0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0)},resizeFileStorage(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0}else{var oldContents=node.contents;node.contents=new Uint8Array(newSize);if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)))}node.usedBytes=newSize}},node_ops:{getattr(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.atime);attr.mtime=new Date(node.mtime);attr.ctime=new Date(node.ctime);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr},setattr(node,attr){for(const key of["mode","atime","mtime","ctime"]){if(attr[key]!=null){node[key]=attr[key]}}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}},lookup(parent,name){if(!MEMFS.doesNotExistError){MEMFS.doesNotExistError=new FS.ErrnoError(44);MEMFS.doesNotExistError.stack="<generic error, no stack>"}throw MEMFS.doesNotExistError},mknod(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)},rename(old_node,new_dir,new_name){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node){if(FS.isDir(old_node.mode)){for(var i in new_node.contents){throw new FS.ErrnoError(55)}}FS.hashRemoveNode(new_node)}delete old_node.parent.contents[old_node.name];new_dir.contents[new_name]=old_node;old_node.name=new_name;new_dir.ctime=new_dir.mtime=old_node.parent.ctime=old_node.parent.mtime=Date.now()},unlink(parent,name){delete parent.contents[name];parent.ctime=parent.mtime=Date.now()},rmdir(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(55)}delete parent.contents[name];parent.ctime=parent.mtime=Date.now()},readdir(node){return[".","..",...Object.keys(node.contents)]},symlink(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node},readlink(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(28)}return node.link}},stream_ops:{read(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset)}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i]}return size},write(stream,buffer,offset,length,position,canOwn){if(buffer.buffer===(growMemViews(),HEAP8).buffer){canOwn=false}if(!length)return 0;var node=stream.node;node.mtime=node.ctime=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=buffer.slice(offset,offset+length);node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray){node.contents.set(buffer.subarray(offset,offset+length),position)}else{for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i]}}node.usedBytes=Math.max(node.usedBytes,position+length);return length},llseek(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(28)}return position},mmap(stream,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&contents&&contents.buffer===(growMemViews(),HEAP8).buffer){allocated=false;ptr=contents.byteOffset}else{allocated=true;ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}if(contents){if(position>0||position+length<contents.length){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}(growMemViews(),HEAP8).set(contents,ptr)}}return{ptr,allocated}},msync(stream,buffer,offset,length,mmapFlags){MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0}}};var FS_modeStringToFlags=str=>{var flagModes={r:0,"r+":2,w:512|64|1,"w+":512|64|2,a:1024|64|1,"a+":1024|64|2};var flags=flagModes[str];if(typeof flags=="undefined"){throw new Error(`Unknown file open mode: ${str}`)}return flags};var FS_getMode=(canRead,canWrite)=>{var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode};var asyncLoad=async url=>{var arrayBuffer=await readAsync(url);return new Uint8Array(arrayBuffer)};var FS_createDataFile=(...args)=>FS.createDataFile(...args);var getUniqueRunDependency=id=>id;var preloadPlugins=[];var FS_handledByPreloadPlugin=async(byteArray,fullname)=>{if(typeof Browser!="undefined")Browser.init();for(var plugin of preloadPlugins){if(plugin["canHandle"](fullname)){return plugin["handle"](byteArray,fullname)}}return byteArray};var FS_preloadFile=async(parent,name,url,canRead,canWrite,dontCreateFile,canOwn,preFinish)=>{var fullname=name?PATH_FS.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency(`cp ${fullname}`);addRunDependency(dep);try{var byteArray=url;if(typeof url=="string"){byteArray=await asyncLoad(url)}byteArray=await FS_handledByPreloadPlugin(byteArray,fullname);preFinish?.();if(!dontCreateFile){FS_createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}}finally{removeRunDependency(dep)}};var FS_createPreloadedFile=(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish)=>{FS_preloadFile(parent,name,url,canRead,canWrite,dontCreateFile,canOwn,preFinish).then(onload).catch(onerror)};var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,filesystems:null,syncFSRequests:0,readFiles:{},ErrnoError:class{name="ErrnoError";constructor(errno){this.errno=errno}},FSStream:class{shared={};get object(){return this.node}set object(val){this.node=val}get isRead(){return(this.flags&2097155)!==1}get isWrite(){return(this.flags&2097155)!==0}get isAppend(){return this.flags&1024}get flags(){return this.shared.flags}set flags(val){this.shared.flags=val}get position(){return this.shared.position}set position(val){this.shared.position=val}},FSNode:class{node_ops={};stream_ops={};readMode=292|73;writeMode=146;mounted=null;constructor(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.rdev=rdev;this.atime=this.mtime=this.ctime=Date.now()}get read(){return(this.mode&this.readMode)===this.readMode}set read(val){val?this.mode|=this.readMode:this.mode&=~this.readMode}get write(){return(this.mode&this.writeMode)===this.writeMode}set write(val){val?this.mode|=this.writeMode:this.mode&=~this.writeMode}get isFolder(){return FS.isDir(this.mode)}get isDevice(){return FS.isChrdev(this.mode)}},lookupPath(path,opts={}){if(!path){throw new FS.ErrnoError(44)}opts.follow_mount??=true;if(!PATH.isAbs(path)){path=FS.cwd()+"/"+path}linkloop:for(var nlinks=0;nlinks<40;nlinks++){var parts=path.split("/").filter(p=>!!p);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}if(parts[i]==="."){continue}if(parts[i]===".."){current_path=PATH.dirname(current_path);if(FS.isRoot(current)){path=current_path+"/"+parts.slice(i+1).join("/");nlinks--;continue linkloop}else{current=current.parent}continue}current_path=PATH.join2(current_path,parts[i]);try{current=FS.lookupNode(current,parts[i])}catch(e){if(e?.errno===44&&islast&&opts.noent_okay){return{path:current_path}}throw e}if(FS.isMountpoint(current)&&(!islast||opts.follow_mount)){current=current.mounted.root}if(FS.isLink(current.mode)&&(!islast||opts.follow)){if(!current.node_ops.readlink){throw new FS.ErrnoError(52)}var link=current.node_ops.readlink(current);if(!PATH.isAbs(link)){link=PATH.dirname(current_path)+"/"+link}path=link+"/"+parts.slice(i+1).join("/");continue linkloop}}return{path:current_path,node:current}}throw new FS.ErrnoError(32)},getPath(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?`${mount}/${path}`:mount+path}path=path?`${node.name}/${path}`:node.name;node=node.parent}},hashName(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length},hashAddNode(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node},hashRemoveNode(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}},lookupNode(parent,name){var errCode=FS.mayLookup(parent);if(errCode){throw new FS.ErrnoError(errCode)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)},createNode(parent,name,mode,rdev){var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node},destroyNode(node){FS.hashRemoveNode(node)},isRoot(node){return node===node.parent},isMountpoint(node){return!!node.mounted},isFile(mode){return(mode&61440)===32768},isDir(mode){return(mode&61440)===16384},isLink(mode){return(mode&61440)===40960},isChrdev(mode){return(mode&61440)===8192},isBlkdev(mode){return(mode&61440)===24576},isFIFO(mode){return(mode&61440)===4096},isSocket(mode){return(mode&49152)===49152},flagsToPermissionString(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w"}return perms},nodePermissions(node,perms){if(FS.ignorePermissions){return 0}if(perms.includes("r")&&!(node.mode&292)){return 2}else if(perms.includes("w")&&!(node.mode&146)){return 2}else if(perms.includes("x")&&!(node.mode&73)){return 2}return 0},mayLookup(dir){if(!FS.isDir(dir.mode))return 54;var errCode=FS.nodePermissions(dir,"x");if(errCode)return errCode;if(!dir.node_ops.lookup)return 2;return 0},mayCreate(dir,name){if(!FS.isDir(dir.mode)){return 54}try{var node=FS.lookupNode(dir,name);return 20}catch(e){}return FS.nodePermissions(dir,"wx")},mayDelete(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var errCode=FS.nodePermissions(dir,"wx");if(errCode){return errCode}if(isdir){if(!FS.isDir(node.mode)){return 54}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return 10}}else{if(FS.isDir(node.mode)){return 31}}return 0},mayOpen(node,flags){if(!node){return 44}if(FS.isLink(node.mode)){return 32}else if(FS.isDir(node.mode)){if(FS.flagsToPermissionString(flags)!=="r"||flags&(512|64)){return 31}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))},checkOpExists(op,err){if(!op){throw new FS.ErrnoError(err)}return op},MAX_OPEN_FDS:4096,nextfd(){for(var fd=0;fd<=FS.MAX_OPEN_FDS;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(33)},getStreamChecked(fd){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}return stream},getStream:fd=>FS.streams[fd],createStream(stream,fd=-1){stream=Object.assign(new FS.FSStream,stream);if(fd==-1){fd=FS.nextfd()}stream.fd=fd;FS.streams[fd]=stream;return stream},closeStream(fd){FS.streams[fd]=null},dupStream(origStream,fd=-1){var stream=FS.createStream(origStream,fd);stream.stream_ops?.dup?.(stream);return stream},doSetAttr(stream,node,attr){var setattr=stream?.stream_ops.setattr;var arg=setattr?stream:node;setattr??=node.node_ops.setattr;FS.checkOpExists(setattr,63);setattr(arg,attr)},chrdev_stream_ops:{open(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;stream.stream_ops.open?.(stream)},llseek(){throw new FS.ErrnoError(70)}},major:dev=>dev>>8,minor:dev=>dev&255,makedev:(ma,mi)=>ma<<8|mi,registerDevice(dev,ops){FS.devices[dev]={stream_ops:ops}},getDevice:dev=>FS.devices[dev],getMounts(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push(...m.mounts)}return mounts},syncfs(populate,callback){if(typeof populate=="function"){callback=populate;populate=false}FS.syncFSRequests++;if(FS.syncFSRequests>1){err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)}var mounts=FS.getMounts(FS.root.mount);var completed=0;function doCallback(errCode){FS.syncFSRequests--;return callback(errCode)}function done(errCode){if(errCode){if(!done.errored){done.errored=true;return doCallback(errCode)}return}if(++completed>=mounts.length){doCallback(null)}}for(var mount of mounts){if(mount.type.syncfs){mount.type.syncfs(mount,populate,done)}else{done(null)}}},mount(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(10)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}}var mount={type,opts,mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot},unmount(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(28)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);for(var[hash,current]of Object.entries(FS.nameTable)){while(current){var next=current.name_next;if(mounts.includes(current.mount)){FS.destroyNode(current)}current=next}}node.mounted=null;var idx=node.mount.mounts.indexOf(mount);node.mount.mounts.splice(idx,1)},lookup(parent,name){return parent.node_ops.lookup(parent,name)},mknod(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name){throw new FS.ErrnoError(28)}if(name==="."||name===".."){throw new FS.ErrnoError(20)}var errCode=FS.mayCreate(parent,name);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(63)}return parent.node_ops.mknod(parent,name,mode,dev)},statfs(path){return FS.statfsNode(FS.lookupPath(path,{follow:true}).node)},statfsStream(stream){return FS.statfsNode(stream.node)},statfsNode(node){var rtn={bsize:4096,frsize:4096,blocks:1e6,bfree:5e5,bavail:5e5,files:FS.nextInode,ffree:FS.nextInode-1,fsid:42,flags:2,namelen:255};if(node.node_ops.statfs){Object.assign(rtn,node.node_ops.statfs(node.mount.opts.root))}return rtn},create(path,mode=438){mode&=4095;mode|=32768;return FS.mknod(path,mode,0)},mkdir(path,mode=511){mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)},mkdirTree(path,mode){var dirs=path.split("/");var d="";for(var dir of dirs){if(!dir)continue;if(d||PATH.isAbs(path))d+="/";d+=dir;try{FS.mkdir(d,mode)}catch(e){if(e.errno!=20)throw e}}},mkdev(path,mode,dev){if(typeof dev=="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)},symlink(oldpath,newpath){if(!PATH_FS.resolve(oldpath)){throw new FS.ErrnoError(44)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(63)}return parent.node_ops.symlink(parent,newname,oldpath)},rename(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;if(!old_dir||!new_dir)throw new FS.ErrnoError(44);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(75)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH_FS.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(28)}relative=PATH_FS.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(55)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var errCode=FS.mayDelete(old_dir,old_name,isdir);if(errCode){throw new FS.ErrnoError(errCode)}errCode=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(errCode){throw new FS.ErrnoError(errCode)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(63)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(10)}if(new_dir!==old_dir){errCode=FS.nodePermissions(old_dir,"w");if(errCode){throw new FS.ErrnoError(errCode)}}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name);old_node.parent=new_dir}catch(e){throw e}finally{FS.hashAddNode(old_node)}},rmdir(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,true);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node)},readdir(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;var readdir=FS.checkOpExists(node.node_ops.readdir,54);return readdir(node)},unlink(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,false);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.unlink(parent,name);FS.destroyNode(node)},readlink(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(44)}if(!link.node_ops.readlink){throw new FS.ErrnoError(28)}return link.node_ops.readlink(link)},stat(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;var getattr=FS.checkOpExists(node.node_ops.getattr,63);return getattr(node)},fstat(fd){var stream=FS.getStreamChecked(fd);var node=stream.node;var getattr=stream.stream_ops.getattr;var arg=getattr?stream:node;getattr??=node.node_ops.getattr;FS.checkOpExists(getattr,63);return getattr(arg)},lstat(path){return FS.stat(path,true)},doChmod(stream,node,mode,dontFollow){FS.doSetAttr(stream,node,{mode:mode&4095|node.mode&~4095,ctime:Date.now(),dontFollow})},chmod(path,mode,dontFollow){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}FS.doChmod(null,node,mode,dontFollow)},lchmod(path,mode){FS.chmod(path,mode,true)},fchmod(fd,mode){var stream=FS.getStreamChecked(fd);FS.doChmod(stream,stream.node,mode,false)},doChown(stream,node,dontFollow){FS.doSetAttr(stream,node,{timestamp:Date.now(),dontFollow})},chown(path,uid,gid,dontFollow){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}FS.doChown(null,node,dontFollow)},lchown(path,uid,gid){FS.chown(path,uid,gid,true)},fchown(fd,uid,gid){var stream=FS.getStreamChecked(fd);FS.doChown(stream,stream.node,false)},doTruncate(stream,node,len){if(FS.isDir(node.mode)){throw new FS.ErrnoError(31)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(28)}var errCode=FS.nodePermissions(node,"w");if(errCode){throw new FS.ErrnoError(errCode)}FS.doSetAttr(stream,node,{size:len,timestamp:Date.now()})},truncate(path,len){if(len<0){throw new FS.ErrnoError(28)}var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}FS.doTruncate(null,node,len)},ftruncate(fd,len){var stream=FS.getStreamChecked(fd);if(len<0||(stream.flags&2097155)===0){throw new FS.ErrnoError(28)}FS.doTruncate(stream,stream.node,len)},utime(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;var setattr=FS.checkOpExists(node.node_ops.setattr,63);setattr(node,{atime,mtime})},open(path,flags,mode=438){if(path===""){throw new FS.ErrnoError(44)}flags=typeof flags=="string"?FS_modeStringToFlags(flags):flags;if(flags&64){mode=mode&4095|32768}else{mode=0}var node;var isDirPath;if(typeof path=="object"){node=path}else{isDirPath=path.endsWith("/");var lookup=FS.lookupPath(path,{follow:!(flags&131072),noent_okay:true});node=lookup.node;path=lookup.path}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(20)}}else if(isDirPath){throw new FS.ErrnoError(31)}else{node=FS.mknod(path,mode|511,0);created=true}}if(!node){throw new FS.ErrnoError(44)}if(FS.isChrdev(node.mode)){flags&=~512}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}if(!created){var errCode=FS.mayOpen(node,flags);if(errCode){throw new FS.ErrnoError(errCode)}}if(flags&512&&!created){FS.truncate(node,0)}flags&=~(128|512|131072);var stream=FS.createStream({node,path:FS.getPath(node),flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false});if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(created){FS.chmod(node,mode&511)}if(Module["logReadFiles"]&&!(flags&1)){if(!(path in FS.readFiles)){FS.readFiles[path]=1}}return stream},close(stream){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}stream.fd=null},isClosed(stream){return stream.fd===null},llseek(stream,offset,whence){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(70)}if(whence!=0&&whence!=1&&whence!=2){throw new FS.ErrnoError(28)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position},read(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.read){throw new FS.ErrnoError(28)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead},write(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.write){throw new FS.ErrnoError(28)}if(stream.seekable&&stream.flags&1024){FS.llseek(stream,0,2)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;return bytesWritten},mmap(stream,length,position,prot,flags){if((prot&2)!==0&&(flags&2)===0&&(stream.flags&2097155)!==2){throw new FS.ErrnoError(2)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(2)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(43)}if(!length){throw new FS.ErrnoError(28)}return stream.stream_ops.mmap(stream,length,position,prot,flags)},msync(stream,buffer,offset,length,mmapFlags){if(!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)},ioctl(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(59)}return stream.stream_ops.ioctl(stream,cmd,arg)},readFile(path,opts={}){opts.flags=opts.flags||0;opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){abort(`Invalid encoding type "${opts.encoding}"`)}var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){buf=UTF8ArrayToString(buf)}FS.close(stream);return buf},writeFile(path,data,opts={}){opts.flags=opts.flags||577;var stream=FS.open(path,opts.flags,opts.mode);if(typeof data=="string"){data=new Uint8Array(intArrayFromString(data,true))}if(ArrayBuffer.isView(data)){FS.write(stream,data,0,data.byteLength,undefined,opts.canOwn)}else{abort("Unsupported data type")}FS.close(stream)},cwd:()=>FS.currentPath,chdir(path){var lookup=FS.lookupPath(path,{follow:true});if(lookup.node===null){throw new FS.ErrnoError(44)}if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(54)}var errCode=FS.nodePermissions(lookup.node,"x");if(errCode){throw new FS.ErrnoError(errCode)}FS.currentPath=lookup.path},createDefaultDirectories(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")},createDefaultDevices(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:()=>0,write:(stream,buffer,offset,length,pos)=>length,llseek:()=>0});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var randomBuffer=new Uint8Array(1024),randomLeft=0;var randomByte=()=>{if(randomLeft===0){randomFill(randomBuffer);randomLeft=randomBuffer.byteLength}return randomBuffer[--randomLeft]};FS.createDevice("/dev","random",randomByte);FS.createDevice("/dev","urandom",randomByte);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")},createSpecialDirectories(){FS.mkdir("/proc");var proc_self=FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount(){var node=FS.createNode(proc_self,"fd",16895,73);node.stream_ops={llseek:MEMFS.stream_ops.llseek};node.node_ops={lookup(parent,name){var fd=+name;var stream=FS.getStreamChecked(fd);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>stream.path},id:fd+1};ret.parent=ret;return ret},readdir(){return Array.from(FS.streams.entries()).filter(([k,v])=>v).map(([k,v])=>k.toString())}};return node}},{},"/proc/self/fd")},createStandardStreams(input,output,error){if(input){FS.createDevice("/dev","stdin",input)}else{FS.symlink("/dev/tty","/dev/stdin")}if(output){FS.createDevice("/dev","stdout",null,output)}else{FS.symlink("/dev/tty","/dev/stdout")}if(error){FS.createDevice("/dev","stderr",null,error)}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin",0);var stdout=FS.open("/dev/stdout",1);var stderr=FS.open("/dev/stderr",1)},staticInit(){FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={MEMFS}},init(input,output,error){FS.initialized=true;input??=Module["stdin"];output??=Module["stdout"];error??=Module["stderr"];FS.createStandardStreams(input,output,error)},quit(){FS.initialized=false;for(var stream of FS.streams){if(stream){FS.close(stream)}}},findObject(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(!ret.exists){return null}return ret.object},analyzePath(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret},createPath(parent,path,canRead,canWrite){parent=typeof parent=="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){if(e.errno!=20)throw e}parent=current}return current},createFile(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(canRead,canWrite);return FS.create(path,mode)},createDataFile(parent,name,data,canRead,canWrite,canOwn){var path=name;if(parent){parent=typeof parent=="string"?parent:FS.getPath(parent);path=name?PATH.join2(parent,name):parent}var mode=FS_getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data=="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr}FS.chmod(node,mode|146);var stream=FS.open(node,577);FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}},createDevice(parent,name,input,output){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(!!input,!!output);FS.createDevice.major??=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open(stream){stream.seekable=false},close(stream){if(output?.buffer?.length){output(10)}},read(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.atime=Date.now()}return bytesRead},write(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(29)}}if(length){stream.node.mtime=stream.node.ctime=Date.now()}return i}});return FS.mkdev(path,mode,dev)},forceLoadFile(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;if(globalThis.XMLHttpRequest){abort("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else{try{obj.contents=readBinary(obj.url)}catch(e){throw new FS.ErrnoError(29)}}},createLazyFile(parent,name,url,canRead,canWrite){class LazyUint8Array{lengthKnown=false;chunks=[];get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]}setDataGetter(getter){this.getter=getter}cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))abort("Couldn\'t load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(from,to)=>{if(from>to)abort("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)abort("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))abort("Couldn\'t load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}return intArrayFromString(xhr.responseText||"",true)};var lazyArray=this;lazyArray.setDataGetter(chunkNum=>{var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]=="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]=="undefined")abort("doXHR failed!");return lazyArray.chunks[chunkNum]});if(usesGzip||!datalength){chunkSize=datalength=1;datalength=this.getter(0).length;chunkSize=datalength;out("LazyFiles on gzip forces download of the whole file when length is accessed")}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true}get length(){if(!this.lengthKnown){this.cacheLength()}return this._length}get chunkSize(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize}}if(globalThis.XMLHttpRequest){if(!ENVIRONMENT_IS_WORKER)abort("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");var lazyArray=new LazyUint8Array;var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperties(node,{usedBytes:{get:function(){return this.contents.length}}});var stream_ops={};for(const[key,fn]of Object.entries(node.stream_ops)){stream_ops[key]=(...args)=>{FS.forceLoadFile(node);return fn(...args)}}function writeChunks(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size}stream_ops.read=(stream,buffer,offset,length,position)=>{FS.forceLoadFile(node);return writeChunks(stream,buffer,offset,length,position)};stream_ops.mmap=(stream,length,position,prot,flags)=>{FS.forceLoadFile(node);var ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}writeChunks(stream,(growMemViews(),HEAP8),ptr,length,position);return{ptr,allocated:true}};node.stream_ops=stream_ops;return node}};var UTF8ToString=(ptr,maxBytesToRead,ignoreNul)=>ptr?UTF8ArrayToString((growMemViews(),HEAPU8),ptr,maxBytesToRead,ignoreNul):"";var SYSCALLS={DEFAULT_POLLMASK:5,calculateAt(dirfd,path,allowEmpty){if(PATH.isAbs(path)){return path}var dir;if(dirfd===-100){dir=FS.cwd()}else{var dirstream=SYSCALLS.getStreamFromFD(dirfd);dir=dirstream.path}if(path.length==0){if(!allowEmpty){throw new FS.ErrnoError(44)}return dir}return dir+"/"+path},writeStat(buf,stat){(growMemViews(),HEAPU32)[buf/4]=stat.dev;(growMemViews(),HEAPU32)[(buf+4)/4]=stat.mode;(growMemViews(),HEAPU64)[(buf+8)/8]=BigInt(stat.nlink);(growMemViews(),HEAPU32)[(buf+16)/4]=stat.uid;(growMemViews(),HEAPU32)[(buf+20)/4]=stat.gid;(growMemViews(),HEAPU32)[(buf+24)/4]=stat.rdev;(growMemViews(),HEAP64)[(buf+32)/8]=BigInt(stat.size);(growMemViews(),HEAP32)[(buf+40)/4]=4096;(growMemViews(),HEAP32)[(buf+44)/4]=stat.blocks;var atime=stat.atime.getTime();var mtime=stat.mtime.getTime();var ctime=stat.ctime.getTime();(growMemViews(),HEAP64)[(buf+48)/8]=BigInt(Math.floor(atime/1e3));(growMemViews(),HEAPU64)[(buf+56)/8]=BigInt(atime%1e3*1e3*1e3);(growMemViews(),HEAP64)[(buf+64)/8]=BigInt(Math.floor(mtime/1e3));(growMemViews(),HEAPU64)[(buf+72)/8]=BigInt(mtime%1e3*1e3*1e3);(growMemViews(),HEAP64)[(buf+80)/8]=BigInt(Math.floor(ctime/1e3));(growMemViews(),HEAPU64)[(buf+88)/8]=BigInt(ctime%1e3*1e3*1e3);(growMemViews(),HEAP64)[(buf+96)/8]=BigInt(stat.ino);return 0},writeStatFs(buf,stats){(growMemViews(),HEAPU32)[(buf+8)/4]=stats.bsize;(growMemViews(),HEAPU32)[(buf+72)/4]=stats.bsize;(growMemViews(),HEAP64)[(buf+16)/8]=BigInt(stats.blocks);(growMemViews(),HEAP64)[(buf+24)/8]=BigInt(stats.bfree);(growMemViews(),HEAP64)[(buf+32)/8]=BigInt(stats.bavail);(growMemViews(),HEAP64)[(buf+40)/8]=BigInt(stats.files);(growMemViews(),HEAP64)[(buf+48)/8]=BigInt(stats.ffree);(growMemViews(),HEAPU32)[(buf+56)/4]=stats.fsid;(growMemViews(),HEAPU32)[(buf+80)/4]=stats.flags;(growMemViews(),HEAPU32)[(buf+64)/4]=stats.namelen},doMsync(addr,stream,len,flags,offset){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}if(flags&2){return 0}var buffer=(growMemViews(),HEAPU8).slice(addr,addr+len);FS.msync(stream,buffer,offset,len,flags)},getStreamFromFD(fd){var stream=FS.getStreamChecked(fd);return stream},varargs:undefined,getStr(ptr){var ret=UTF8ToString(ptr);return ret}};function ___syscall_fcntl64(fd,cmd,varargs){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(3,0,1,fd,cmd,varargs);varargs=bigintToI53Checked(varargs);SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(cmd){case 0:{var arg=syscallGetVarargI();if(arg<0){return-28}while(FS.streams[arg]){arg++}var newStream;newStream=FS.dupStream(stream,arg);return newStream.fd}case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=syscallGetVarargI();stream.flags|=arg;return 0}case 5:{var arg=syscallGetVarargP();var offset=0;(growMemViews(),HEAP16)[(arg+offset)/2]=2;return 0}case 6:case 7:return 0}return-28}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_fstat64(fd,buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(4,0,1,fd,buf);buf=bigintToI53Checked(buf);try{return SYSCALLS.writeStat(buf,FS.fstat(fd))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var stringToUTF8=(str,outPtr,maxBytesToWrite)=>stringToUTF8Array(str,(growMemViews(),HEAPU8),outPtr,maxBytesToWrite);function ___syscall_getcwd(buf,size){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(5,0,1,buf,size);buf=bigintToI53Checked(buf);size=bigintToI53Checked(size);try{if(size===0)return-28;var cwd=FS.cwd();var cwdLengthInBytes=lengthBytesUTF8(cwd)+1;if(size<cwdLengthInBytes)return-68;stringToUTF8(cwd,buf,size);return cwdLengthInBytes}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_getdents64(fd,dirp,count){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(6,0,1,fd,dirp,count);dirp=bigintToI53Checked(dirp);count=bigintToI53Checked(count);try{var stream=SYSCALLS.getStreamFromFD(fd);stream.getdents||=FS.readdir(stream.path);var struct_size=280;var pos=0;var off=FS.llseek(stream,0,1);var startIdx=Math.floor(off/struct_size);var endIdx=Math.min(stream.getdents.length,startIdx+Math.floor(count/struct_size));for(var idx=startIdx;idx<endIdx;idx++){var id;var type;var name=stream.getdents[idx];if(name==="."){id=stream.node.id;type=4}else if(name===".."){var lookup=FS.lookupPath(stream.path,{parent:true});id=lookup.node.id;type=4}else{var child;try{child=FS.lookupNode(stream.node,name)}catch(e){if(e?.errno===28){continue}throw e}id=child.id;type=FS.isChrdev(child.mode)?2:FS.isDir(child.mode)?4:FS.isLink(child.mode)?10:8}(growMemViews(),HEAP64)[(dirp+pos)/8]=BigInt(id);(growMemViews(),HEAP64)[(dirp+pos+8)/8]=BigInt((idx+1)*struct_size);(growMemViews(),HEAP16)[(dirp+pos+16)/2]=280;(growMemViews(),HEAP8)[dirp+pos+18]=type;stringToUTF8(name,dirp+pos+19,256);pos+=struct_size}FS.llseek(stream,idx*struct_size,0);return pos}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_ioctl(fd,op,varargs){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(7,0,1,fd,op,varargs);varargs=bigintToI53Checked(varargs);SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(op){case 21509:{if(!stream.tty)return-59;return 0}case 21505:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tcgets){var termios=stream.tty.ops.ioctl_tcgets(stream);var argp=syscallGetVarargP();(growMemViews(),HEAP32)[argp/4]=termios.c_iflag||0;(growMemViews(),HEAP32)[(argp+4)/4]=termios.c_oflag||0;(growMemViews(),HEAP32)[(argp+8)/4]=termios.c_cflag||0;(growMemViews(),HEAP32)[(argp+12)/4]=termios.c_lflag||0;for(var i=0;i<32;i++){(growMemViews(),HEAP8)[argp+i+17]=termios.c_cc[i]||0}return 0}return 0}case 21510:case 21511:case 21512:{if(!stream.tty)return-59;return 0}case 21506:case 21507:case 21508:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tcsets){var argp=syscallGetVarargP();var c_iflag=(growMemViews(),HEAP32)[argp/4];var c_oflag=(growMemViews(),HEAP32)[(argp+4)/4];var c_cflag=(growMemViews(),HEAP32)[(argp+8)/4];var c_lflag=(growMemViews(),HEAP32)[(argp+12)/4];var c_cc=[];for(var i=0;i<32;i++){c_cc.push((growMemViews(),HEAP8)[argp+i+17])}return stream.tty.ops.ioctl_tcsets(stream.tty,op,{c_iflag,c_oflag,c_cflag,c_lflag,c_cc})}return 0}case 21519:{if(!stream.tty)return-59;var argp=syscallGetVarargP();(growMemViews(),HEAP32)[argp/4]=0;return 0}case 21520:{if(!stream.tty)return-59;return-28}case 21537:case 21531:{var argp=syscallGetVarargP();return FS.ioctl(stream,op,argp)}case 21523:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tiocgwinsz){var winsize=stream.tty.ops.ioctl_tiocgwinsz(stream.tty);var argp=syscallGetVarargP();(growMemViews(),HEAP16)[argp/2]=winsize[0];(growMemViews(),HEAP16)[(argp+2)/2]=winsize[1]}return 0}case 21524:{if(!stream.tty)return-59;return 0}case 21515:{if(!stream.tty)return-59;return 0}default:return-28}}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_lstat64(path,buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(8,0,1,path,buf);path=bigintToI53Checked(path);buf=bigintToI53Checked(buf);try{path=SYSCALLS.getStr(path);return SYSCALLS.writeStat(buf,FS.lstat(path))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_newfstatat(dirfd,path,buf,flags){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(9,0,1,dirfd,path,buf,flags);path=bigintToI53Checked(path);buf=bigintToI53Checked(buf);try{path=SYSCALLS.getStr(path);var nofollow=flags&256;var allowEmpty=flags&4096;flags=flags&~6400;path=SYSCALLS.calculateAt(dirfd,path,allowEmpty);return SYSCALLS.writeStat(buf,nofollow?FS.lstat(path):FS.stat(path))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_openat(dirfd,path,flags,varargs){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(10,0,1,dirfd,path,flags,varargs);path=bigintToI53Checked(path);varargs=bigintToI53Checked(varargs);SYSCALLS.varargs=varargs;try{path=SYSCALLS.getStr(path);path=SYSCALLS.calculateAt(dirfd,path);var mode=varargs?syscallGetVarargI():0;return FS.open(path,flags,mode).fd}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_stat64(path,buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(11,0,1,path,buf);path=bigintToI53Checked(path);buf=bigintToI53Checked(buf);try{path=SYSCALLS.getStr(path);return SYSCALLS.writeStat(buf,FS.stat(path))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var __abort_js=()=>abort("");function __emscripten_init_main_thread_js(tb){tb=bigintToI53Checked(tb);__emscripten_thread_init(tb,!ENVIRONMENT_IS_WORKER,1,!ENVIRONMENT_IS_WEB,65536,false);PThread.threadInitTLS()}var handleException=e=>{if(e instanceof ExitStatus||e=="unwind"){return EXITSTATUS}quit_(1,e)};var maybeExit=()=>{if(!keepRuntimeAlive()){try{if(ENVIRONMENT_IS_PTHREAD){if(_pthread_self())__emscripten_thread_exit(EXITSTATUS);return}_exit(EXITSTATUS)}catch(e){handleException(e)}}};var callUserCallback=func=>{if(ABORT){return}try{func();maybeExit()}catch(e){handleException(e)}};function __emscripten_thread_mailbox_await(pthread_ptr){pthread_ptr=bigintToI53Checked(pthread_ptr);if(Atomics.waitAsync){var wait=Atomics.waitAsync((growMemViews(),HEAP32),pthread_ptr/4,pthread_ptr);wait.value.then(checkMailbox);var waitingAsync=pthread_ptr+228;Atomics.store((growMemViews(),HEAP32),waitingAsync/4,1)}}var checkMailbox=()=>callUserCallback(()=>{var pthread_ptr=_pthread_self();if(pthread_ptr){__emscripten_thread_mailbox_await(pthread_ptr);__emscripten_check_mailbox()}});function __emscripten_notify_mailbox_postmessage(targetThread,currThreadId){targetThread=bigintToI53Checked(targetThread);currThreadId=bigintToI53Checked(currThreadId);if(targetThread==currThreadId){setTimeout(checkMailbox)}else if(ENVIRONMENT_IS_PTHREAD){postMessage({targetThread,cmd:"checkMailbox"})}else{var worker=PThread.pthreads[targetThread];if(!worker){return}worker.postMessage({cmd:"checkMailbox"})}}var proxiedJSCallArgs=[];function __emscripten_receive_on_main_thread_js(funcIndex,emAsmAddr,callingThread,numCallArgs,args){emAsmAddr=bigintToI53Checked(emAsmAddr);callingThread=bigintToI53Checked(callingThread);args=bigintToI53Checked(args);numCallArgs/=2;proxiedJSCallArgs.length=numCallArgs;var b=args/8;for(var i=0;i<numCallArgs;i++){if((growMemViews(),HEAP64)[b+2*i]){proxiedJSCallArgs[i]=(growMemViews(),HEAP64)[b+2*i+1]}else{proxiedJSCallArgs[i]=(growMemViews(),HEAPF64)[b+2*i+1]}}var func=proxiedFunctionTable[funcIndex];PThread.currentProxiedOperationCallerThread=callingThread;var rtn=func(...proxiedJSCallArgs);PThread.currentProxiedOperationCallerThread=0;if(typeof rtn=="bigint"){rtn=bigintToI53Checked(rtn)}return rtn}function __emscripten_thread_cleanup(thread){thread=bigintToI53Checked(thread);if(!ENVIRONMENT_IS_PTHREAD)cleanupThread(thread);else postMessage({cmd:"cleanupThread",thread})}function __emscripten_thread_set_strongref(thread){thread=bigintToI53Checked(thread);if(ENVIRONMENT_IS_NODE){PThread.pthreads[thread].ref()}}var isLeapYear=year=>year%4===0&&(year%100!==0||year%400===0);var MONTH_DAYS_LEAP_CUMULATIVE=[0,31,60,91,121,152,182,213,244,274,305,335];var MONTH_DAYS_REGULAR_CUMULATIVE=[0,31,59,90,120,151,181,212,243,273,304,334];var ydayFromDate=date=>{var leap=isLeapYear(date.getFullYear());var monthDaysCumulative=leap?MONTH_DAYS_LEAP_CUMULATIVE:MONTH_DAYS_REGULAR_CUMULATIVE;var yday=monthDaysCumulative[date.getMonth()]+date.getDate()-1;return yday};function __localtime_js(time,tmPtr){time=bigintToI53Checked(time);tmPtr=bigintToI53Checked(tmPtr);var date=new Date(time*1e3);(growMemViews(),HEAP32)[tmPtr/4]=date.getSeconds();(growMemViews(),HEAP32)[(tmPtr+4)/4]=date.getMinutes();(growMemViews(),HEAP32)[(tmPtr+8)/4]=date.getHours();(growMemViews(),HEAP32)[(tmPtr+12)/4]=date.getDate();(growMemViews(),HEAP32)[(tmPtr+16)/4]=date.getMonth();(growMemViews(),HEAP32)[(tmPtr+20)/4]=date.getFullYear()-1900;(growMemViews(),HEAP32)[(tmPtr+24)/4]=date.getDay();var yday=ydayFromDate(date)|0;(growMemViews(),HEAP32)[(tmPtr+28)/4]=yday;(growMemViews(),HEAP64)[(tmPtr+40)/8]=BigInt(-(date.getTimezoneOffset()*60));var start=new Date(date.getFullYear(),0,1);var summerOffset=new Date(date.getFullYear(),6,1).getTimezoneOffset();var winterOffset=start.getTimezoneOffset();var dst=(summerOffset!=winterOffset&&date.getTimezoneOffset()==Math.min(winterOffset,summerOffset))|0;(growMemViews(),HEAP32)[(tmPtr+32)/4]=dst}function __mmap_js(len,prot,flags,fd,offset,allocated,addr){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(12,0,1,len,prot,flags,fd,offset,allocated,addr);len=bigintToI53Checked(len);offset=bigintToI53Checked(offset);allocated=bigintToI53Checked(allocated);addr=bigintToI53Checked(addr);try{var stream=SYSCALLS.getStreamFromFD(fd);var res=FS.mmap(stream,len,offset,prot,flags);var ptr=res.ptr;(growMemViews(),HEAP32)[allocated/4]=res.allocated;(growMemViews(),HEAPU64)[addr/8]=BigInt(ptr);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function __munmap_js(addr,len,prot,flags,fd,offset){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(13,0,1,addr,len,prot,flags,fd,offset);addr=bigintToI53Checked(addr);len=bigintToI53Checked(len);offset=bigintToI53Checked(offset);try{var stream=SYSCALLS.getStreamFromFD(fd);if(prot&2){SYSCALLS.doMsync(addr,stream,len,flags,offset)}}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var __tzset_js=function(timezone,daylight,std_name,dst_name){timezone=bigintToI53Checked(timezone);daylight=bigintToI53Checked(daylight);std_name=bigintToI53Checked(std_name);dst_name=bigintToI53Checked(dst_name);var currentYear=(new Date).getFullYear();var winter=new Date(currentYear,0,1);var summer=new Date(currentYear,6,1);var winterOffset=winter.getTimezoneOffset();var summerOffset=summer.getTimezoneOffset();var stdTimezoneOffset=Math.max(winterOffset,summerOffset);(growMemViews(),HEAPU64)[timezone/8]=BigInt(stdTimezoneOffset*60);(growMemViews(),HEAP32)[daylight/4]=Number(winterOffset!=summerOffset);var extractZone=timezoneOffset=>{var sign=timezoneOffset>=0?"-":"+";var absOffset=Math.abs(timezoneOffset);var hours=String(Math.floor(absOffset/60)).padStart(2,"0");var minutes=String(absOffset%60).padStart(2,"0");return`UTC${sign}${hours}${minutes}`};var winterName=extractZone(winterOffset);var summerName=extractZone(summerOffset);if(summerOffset<winterOffset){stringToUTF8(winterName,std_name,17);stringToUTF8(summerName,dst_name,17)}else{stringToUTF8(winterName,dst_name,17);stringToUTF8(summerName,std_name,17)}};var _emscripten_get_now=()=>performance.timeOrigin+performance.now();var _emscripten_date_now=()=>Date.now();var nowIsMonotonic=1;var checkWasiClock=clock_id=>clock_id>=0&&clock_id<=3;function _clock_time_get(clk_id,ignored_precision,ptime){ignored_precision=bigintToI53Checked(ignored_precision);ptime=bigintToI53Checked(ptime);if(!checkWasiClock(clk_id)){return 28}var now;if(clk_id===0){now=_emscripten_date_now()}else if(nowIsMonotonic){now=_emscripten_get_now()}else{return 52}var nsec=Math.round(now*1e3*1e3);(growMemViews(),HEAP64)[ptime/8]=BigInt(nsec);return 0}var _emscripten_check_blocking_allowed=()=>{};var runtimeKeepalivePush=()=>{runtimeKeepaliveCounter+=1};var _emscripten_exit_with_live_runtime=()=>{runtimeKeepalivePush();throw"unwind"};var jsStackTrace=()=>(new Error).stack.toString();var getCallstack=flags=>{var callstack=jsStackTrace();var lines=callstack.split("\\n");callstack="";var firefoxRe=new RegExp("\\\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");var chromeRe=new RegExp("\\\\s*at (.*?) \\\\((.*):(.*):(.*)\\\\)");for(var line of lines){var symbolName="";var file="";var lineno=0;var column=0;var parts=chromeRe.exec(line);if(parts?.length==5){symbolName=parts[1];file=parts[2];lineno=parts[3];column=parts[4]}else{parts=firefoxRe.exec(line);if(parts?.length>=4){symbolName=parts[1];file=parts[2];lineno=parts[3];column=parts[4]|0}else{callstack+=line+"\\n";continue}}if(symbolName=="_emscripten_log"||symbolName=="_emscripten_get_callstack"){callstack="";continue}if(flags&24){if(flags&64){file=file.substring(file.replace(/\\\\/g,"/").lastIndexOf("/")+1)}callstack+=`    at ${symbolName} (${file}:${lineno}:${column})\\n`}}callstack=callstack.replace(/\\s+$/,"");return callstack};function _emscripten_get_callstack(flags,str,maxbytes){str=bigintToI53Checked(str);var callstack=getCallstack(flags);if(!str||maxbytes<=0){return lengthBytesUTF8(callstack)+1}var bytesWrittenExcludingNull=stringToUTF8(callstack,str,maxbytes);return bytesWrittenExcludingNull+1}var getHeapMax=()=>4294967296;var _emscripten_get_heap_max=()=>BigInt(getHeapMax());var _emscripten_has_asyncify=()=>2;var _emscripten_num_logical_cores=()=>ENVIRONMENT_IS_NODE?require("os").cpus().length:navigator["hardwareConcurrency"];var growMemory=size=>{var oldHeapSize=wasmMemory.buffer.byteLength;var pages=(size-oldHeapSize+65535)/65536|0;try{wasmMemory.grow(BigInt(pages));updateMemoryViews();return 1}catch(e){}};function _emscripten_resize_heap(requestedSize){requestedSize=bigintToI53Checked(requestedSize);var oldSize=(growMemViews(),HEAPU8).length;if(requestedSize<=oldSize){return false}var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignMemory(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}return false}var stringToUTF8OnStack=str=>{var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8(str,ret,size);return ret};var writeI53ToI64=(ptr,num)=>{(growMemViews(),HEAPU32)[ptr/4]=num;var lower=(growMemViews(),HEAPU32)[ptr/4];(growMemViews(),HEAPU32)[(ptr+4)/4]=(num-lower)/4294967296};var stringToNewUTF8=str=>{var size=lengthBytesUTF8(str)+1;var ret=_malloc(size);if(ret)stringToUTF8(str,ret,size);return ret};var readI53FromI64=ptr=>(growMemViews(),HEAPU32)[ptr/4]+(growMemViews(),HEAP32)[(ptr+4)/4]*4294967296;var WebGPU={Internals:{jsObjects:[],jsObjectInsert:(ptr,jsObject)=>{WebGPU.Internals.jsObjects[ptr]=jsObject},bufferOnUnmaps:[],futures:[],futureInsert:(futureId,promise)=>{WebGPU.Internals.futures[futureId]=new Promise(resolve=>promise.finally(()=>resolve(futureId)))}},getJsObject:ptr=>{if(!ptr)return undefined;return WebGPU.Internals.jsObjects[ptr]},importJsAdapter:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateAdapter(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsBindGroup:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateBindGroup(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsBindGroupLayout:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateBindGroupLayout(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsBuffer:(buffer,parentPtr=0)=>{assert(buffer.mapState==="unmapped");var bufferPtr=_emwgpuCreateBuffer(parentPtr);WebGPU.Internals.jsObjectInsert(bufferPtr,buffer);return bufferPtr},importJsCommandBuffer:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateCommandBuffer(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsCommandEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateCommandEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsComputePassEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateComputePassEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsComputePipeline:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateComputePipeline(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsDevice:(device,parentPtr=0)=>{var queuePtr=_emwgpuCreateQueue(parentPtr);var devicePtr=_emwgpuCreateDevice(parentPtr,queuePtr);WebGPU.Internals.jsObjectInsert(queuePtr,device.queue);WebGPU.Internals.jsObjectInsert(devicePtr,device);return devicePtr},importJsExternalTexture:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateExternalTexture(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsPipelineLayout:(obj,parentPtr=0)=>{var ptr=_emwgpuCreatePipelineLayout(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsQuerySet:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateQuerySet(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsQueue:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateQueue(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderBundle:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderBundle(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderBundleEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderBundleEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderPassEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderPassEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderPipeline:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderPipeline(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsSampler:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateSampler(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsShaderModule:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateShaderModule(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsSurface:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateSurface(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsTexture:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateTexture(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsTextureView:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateTextureView(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},errorCallback:(callback,type,message,userdata)=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(message);((a1,a2,a3)=>getWasmTableEntry(callback).call(null,a1,BigInt(a2),BigInt(a3)))(type,BigInt(messagePtr),userdata);stackRestore(sp)},iterateExtensions:(root,handlers)=>{for(var ptr=Number((growMemViews(),HEAPU64)[root/8]);ptr;ptr=Number((growMemViews(),HEAPU64)[ptr/8])){var sType=(growMemViews(),HEAP32)[(ptr+8)/4];var handler=handlers[sType](ptr)}},setStringView:(ptr,data,length)=>{(growMemViews(),HEAPU64)[ptr/8]=BigInt(data);(growMemViews(),HEAPU64)[(ptr+8)/8]=BigInt(length)},makeStringFromStringView:stringViewPtr=>{var ptr=Number((growMemViews(),HEAPU64)[stringViewPtr/8]);var length=Number((growMemViews(),HEAPU64)[(stringViewPtr+8)/8]);return UTF8ToString(ptr,length)},makeStringFromOptionalStringView:stringViewPtr=>{var ptr=Number((growMemViews(),HEAPU64)[stringViewPtr/8]);var length=Number((growMemViews(),HEAPU64)[(stringViewPtr+8)/8]);if(!ptr){if(length===0){return""}return undefined}return UTF8ToString(ptr,length)},makeColor:ptr=>({r:(growMemViews(),HEAPF64)[ptr/8],g:(growMemViews(),HEAPF64)[(ptr+8)/8],b:(growMemViews(),HEAPF64)[(ptr+16)/8],a:(growMemViews(),HEAPF64)[(ptr+24)/8]}),makeExtent3D:ptr=>({width:(growMemViews(),HEAPU32)[ptr/4],height:(growMemViews(),HEAPU32)[(ptr+4)/4],depthOrArrayLayers:(growMemViews(),HEAPU32)[(ptr+8)/4]}),makeOrigin3D:ptr=>({x:(growMemViews(),HEAPU32)[ptr/4],y:(growMemViews(),HEAPU32)[(ptr+4)/4],z:(growMemViews(),HEAPU32)[(ptr+8)/4]}),makeTexelCopyTextureInfo:ptr=>({texture:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[ptr/8])),mipLevel:(growMemViews(),HEAPU32)[(ptr+8)/4],origin:WebGPU.makeOrigin3D(ptr+12),aspect:WebGPU.TextureAspect[(growMemViews(),HEAP32)[(ptr+24)/4]]}),makeTexelCopyBufferLayout:ptr=>{var bytesPerRow=(growMemViews(),HEAPU32)[(ptr+8)/4];var rowsPerImage=(growMemViews(),HEAPU32)[(ptr+12)/4];return{offset:readI53FromI64(ptr),bytesPerRow:bytesPerRow===4294967295?undefined:bytesPerRow,rowsPerImage:rowsPerImage===4294967295?undefined:rowsPerImage}},makeTexelCopyBufferInfo:ptr=>{var layoutPtr=ptr+0;var bufferCopyView=WebGPU.makeTexelCopyBufferLayout(layoutPtr);bufferCopyView["buffer"]=WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(ptr+16)/8]));return bufferCopyView},makePassTimestampWrites:ptr=>{if(ptr===0)return undefined;return{querySet:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(ptr+8)/8])),beginningOfPassWriteIndex:(growMemViews(),HEAPU32)[(ptr+16)/4],endOfPassWriteIndex:(growMemViews(),HEAPU32)[(ptr+20)/4]}},makePipelineConstants:(constantCount,constantsPtr)=>{if(!constantCount)return;var constants={};for(var i=0;i<constantCount;++i){var entryPtr=constantsPtr+32*i;var key=WebGPU.makeStringFromStringView(entryPtr+8);constants[key]=(growMemViews(),HEAPF64)[(entryPtr+24)/8]}return constants},makePipelineLayout:layoutPtr=>{if(!layoutPtr)return"auto";return WebGPU.getJsObject(layoutPtr)},makeComputeState:ptr=>{if(!ptr)return undefined;var desc={module:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(ptr+8)/8])),constants:WebGPU.makePipelineConstants(Number((growMemViews(),HEAPU64)[(ptr+32)/8]),Number((growMemViews(),HEAPU64)[(ptr+40)/8])),entryPoint:WebGPU.makeStringFromOptionalStringView(ptr+16)};return desc},makeComputePipelineDesc:descriptor=>{var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),layout:WebGPU.makePipelineLayout(Number((growMemViews(),HEAPU64)[(descriptor+24)/8])),compute:WebGPU.makeComputeState(descriptor+32)};return desc},makeRenderPipelineDesc:descriptor=>{function makePrimitiveState(psPtr){if(!psPtr)return undefined;return{topology:WebGPU.PrimitiveTopology[(growMemViews(),HEAP32)[(psPtr+8)/4]],stripIndexFormat:WebGPU.IndexFormat[(growMemViews(),HEAP32)[(psPtr+12)/4]],frontFace:WebGPU.FrontFace[(growMemViews(),HEAP32)[(psPtr+16)/4]],cullMode:WebGPU.CullMode[(growMemViews(),HEAP32)[(psPtr+20)/4]],unclippedDepth:!!(growMemViews(),HEAPU32)[(psPtr+24)/4]}}function makeBlendComponent(bdPtr){if(!bdPtr)return undefined;return{operation:WebGPU.BlendOperation[(growMemViews(),HEAP32)[bdPtr/4]],srcFactor:WebGPU.BlendFactor[(growMemViews(),HEAP32)[(bdPtr+4)/4]],dstFactor:WebGPU.BlendFactor[(growMemViews(),HEAP32)[(bdPtr+8)/4]]}}function makeBlendState(bsPtr){if(!bsPtr)return undefined;return{alpha:makeBlendComponent(bsPtr+12),color:makeBlendComponent(bsPtr+0)}}function makeColorState(csPtr){var format=WebGPU.TextureFormat[(growMemViews(),HEAP32)[(csPtr+8)/4]];return format?{format,blend:makeBlendState(Number((growMemViews(),HEAPU64)[(csPtr+16)/8])),writeMask:(growMemViews(),HEAPU32)[(csPtr+24)/4]}:undefined}function makeColorStates(count,csArrayPtr){var states=[];for(var i=0;i<count;++i){states.push(makeColorState(csArrayPtr+32*i))}return states}function makeStencilStateFace(ssfPtr){return{compare:WebGPU.CompareFunction[(growMemViews(),HEAP32)[ssfPtr/4]],failOp:WebGPU.StencilOperation[(growMemViews(),HEAP32)[(ssfPtr+4)/4]],depthFailOp:WebGPU.StencilOperation[(growMemViews(),HEAP32)[(ssfPtr+8)/4]],passOp:WebGPU.StencilOperation[(growMemViews(),HEAP32)[(ssfPtr+12)/4]]}}function makeDepthStencilState(dssPtr){if(!dssPtr)return undefined;return{format:WebGPU.TextureFormat[(growMemViews(),HEAP32)[(dssPtr+8)/4]],depthWriteEnabled:!!(growMemViews(),HEAPU32)[(dssPtr+12)/4],depthCompare:WebGPU.CompareFunction[(growMemViews(),HEAP32)[(dssPtr+16)/4]],stencilFront:makeStencilStateFace(dssPtr+20),stencilBack:makeStencilStateFace(dssPtr+36),stencilReadMask:(growMemViews(),HEAPU32)[(dssPtr+52)/4],stencilWriteMask:(growMemViews(),HEAPU32)[(dssPtr+56)/4],depthBias:(growMemViews(),HEAP32)[(dssPtr+60)/4],depthBiasSlopeScale:(growMemViews(),HEAPF32)[(dssPtr+64)/4],depthBiasClamp:(growMemViews(),HEAPF32)[(dssPtr+68)/4]}}function makeVertexAttribute(vaPtr){return{format:WebGPU.VertexFormat[(growMemViews(),HEAP32)[(vaPtr+8)/4]],offset:readI53FromI64(vaPtr+16),shaderLocation:(growMemViews(),HEAPU32)[(vaPtr+24)/4]}}function makeVertexAttributes(count,vaArrayPtr){var vas=[];for(var i=0;i<count;++i){vas.push(makeVertexAttribute(vaArrayPtr+i*32))}return vas}function makeVertexBuffer(vbPtr){if(!vbPtr)return undefined;var stepMode=WebGPU.VertexStepMode[(growMemViews(),HEAP32)[(vbPtr+8)/4]];var attributeCount=Number((growMemViews(),HEAPU64)[(vbPtr+24)/8]);if(!stepMode&&!attributeCount){return null}return{arrayStride:readI53FromI64(vbPtr+16),stepMode,attributes:makeVertexAttributes(attributeCount,Number((growMemViews(),HEAPU64)[(vbPtr+32)/8]))}}function makeVertexBuffers(count,vbArrayPtr){if(!count)return undefined;var vbs=[];for(var i=0;i<count;++i){vbs.push(makeVertexBuffer(vbArrayPtr+i*40))}return vbs}function makeVertexState(viPtr){if(!viPtr)return undefined;var desc={module:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(viPtr+8)/8])),constants:WebGPU.makePipelineConstants(Number((growMemViews(),HEAPU64)[(viPtr+32)/8]),Number((growMemViews(),HEAPU64)[(viPtr+40)/8])),buffers:makeVertexBuffers(Number((growMemViews(),HEAPU64)[(viPtr+48)/8]),Number((growMemViews(),HEAPU64)[(viPtr+56)/8])),entryPoint:WebGPU.makeStringFromOptionalStringView(viPtr+16)};return desc}function makeMultisampleState(msPtr){if(!msPtr)return undefined;return{count:(growMemViews(),HEAPU32)[(msPtr+8)/4],mask:(growMemViews(),HEAPU32)[(msPtr+12)/4],alphaToCoverageEnabled:!!(growMemViews(),HEAPU32)[(msPtr+16)/4]}}function makeFragmentState(fsPtr){if(!fsPtr)return undefined;var desc={module:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(fsPtr+8)/8])),constants:WebGPU.makePipelineConstants(Number((growMemViews(),HEAPU64)[(fsPtr+32)/8]),Number((growMemViews(),HEAPU64)[(fsPtr+40)/8])),targets:makeColorStates(Number((growMemViews(),HEAPU64)[(fsPtr+48)/8]),Number((growMemViews(),HEAPU64)[(fsPtr+56)/8])),entryPoint:WebGPU.makeStringFromOptionalStringView(fsPtr+16)};return desc}var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),layout:WebGPU.makePipelineLayout(Number((growMemViews(),HEAPU64)[(descriptor+24)/8])),vertex:makeVertexState(descriptor+32),primitive:makePrimitiveState(descriptor+96),depthStencil:makeDepthStencilState(Number((growMemViews(),HEAPU64)[(descriptor+128)/8])),multisample:makeMultisampleState(descriptor+136),fragment:makeFragmentState(Number((growMemViews(),HEAPU64)[(descriptor+160)/8]))};return desc},fillLimitStruct:(limits,limitsOutPtr)=>{var nextInChainPtr=Number((growMemViews(),HEAPU64)[limitsOutPtr/8]);function setLimitValueU32(name,basePtr,limitOffset,fallbackValue=0){var limitValue=limits[name]??fallbackValue;(growMemViews(),HEAPU32)[(basePtr+limitOffset)/4]=limitValue}function setLimitValueU64(name,basePtr,limitOffset,fallbackValue=0){var limitValue=limits[name]??fallbackValue;writeI53ToI64(basePtr+limitOffset,limitValue)}setLimitValueU32("maxTextureDimension1D",limitsOutPtr,8);setLimitValueU32("maxTextureDimension2D",limitsOutPtr,12);setLimitValueU32("maxTextureDimension3D",limitsOutPtr,16);setLimitValueU32("maxTextureArrayLayers",limitsOutPtr,20);setLimitValueU32("maxBindGroups",limitsOutPtr,24);setLimitValueU32("maxBindGroupsPlusVertexBuffers",limitsOutPtr,28);setLimitValueU32("maxBindingsPerBindGroup",limitsOutPtr,32);setLimitValueU32("maxDynamicUniformBuffersPerPipelineLayout",limitsOutPtr,36);setLimitValueU32("maxDynamicStorageBuffersPerPipelineLayout",limitsOutPtr,40);setLimitValueU32("maxSampledTexturesPerShaderStage",limitsOutPtr,44);setLimitValueU32("maxSamplersPerShaderStage",limitsOutPtr,48);setLimitValueU32("maxStorageBuffersPerShaderStage",limitsOutPtr,52);setLimitValueU32("maxStorageTexturesPerShaderStage",limitsOutPtr,56);setLimitValueU32("maxUniformBuffersPerShaderStage",limitsOutPtr,60);setLimitValueU32("minUniformBufferOffsetAlignment",limitsOutPtr,80);setLimitValueU32("minStorageBufferOffsetAlignment",limitsOutPtr,84);setLimitValueU64("maxUniformBufferBindingSize",limitsOutPtr,64);setLimitValueU64("maxStorageBufferBindingSize",limitsOutPtr,72);setLimitValueU32("maxVertexBuffers",limitsOutPtr,88);setLimitValueU64("maxBufferSize",limitsOutPtr,96);setLimitValueU32("maxVertexAttributes",limitsOutPtr,104);setLimitValueU32("maxVertexBufferArrayStride",limitsOutPtr,108);setLimitValueU32("maxInterStageShaderVariables",limitsOutPtr,112);setLimitValueU32("maxColorAttachments",limitsOutPtr,116);setLimitValueU32("maxColorAttachmentBytesPerSample",limitsOutPtr,120);setLimitValueU32("maxComputeWorkgroupStorageSize",limitsOutPtr,124);setLimitValueU32("maxComputeInvocationsPerWorkgroup",limitsOutPtr,128);setLimitValueU32("maxComputeWorkgroupSizeX",limitsOutPtr,132);setLimitValueU32("maxComputeWorkgroupSizeY",limitsOutPtr,136);setLimitValueU32("maxComputeWorkgroupSizeZ",limitsOutPtr,140);setLimitValueU32("maxComputeWorkgroupsPerDimension",limitsOutPtr,144);setLimitValueU32("maxImmediateSize",limitsOutPtr,148);if(nextInChainPtr!==0){var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var compatibilityModeLimitsPtr=nextInChainPtr;setLimitValueU32("maxStorageBuffersInVertexStage",compatibilityModeLimitsPtr,16,limits.maxStorageBuffersPerShaderStage);setLimitValueU32("maxStorageBuffersInFragmentStage",compatibilityModeLimitsPtr,24,limits.maxStorageBuffersPerShaderStage);setLimitValueU32("maxStorageTexturesInVertexStage",compatibilityModeLimitsPtr,20,limits.maxStorageTexturesPerShaderStage);setLimitValueU32("maxStorageTexturesInFragmentStage",compatibilityModeLimitsPtr,28,limits.maxStorageTexturesPerShaderStage)}},fillAdapterInfoStruct:(info,infoStruct)=>{(growMemViews(),HEAPU32)[(infoStruct+88)/4]=info.subgroupMinSize;(growMemViews(),HEAPU32)[(infoStruct+92)/4]=info.subgroupMaxSize;var strs=info.vendor+info.architecture+info.device+info.description;var strPtr=stringToNewUTF8(strs);var vendorLen=lengthBytesUTF8(info.vendor);WebGPU.setStringView(infoStruct+8,strPtr,vendorLen);strPtr+=vendorLen;var architectureLen=lengthBytesUTF8(info.architecture);WebGPU.setStringView(infoStruct+24,strPtr,architectureLen);strPtr+=architectureLen;var deviceLen=lengthBytesUTF8(info.device);WebGPU.setStringView(infoStruct+40,strPtr,deviceLen);strPtr+=deviceLen;var descriptionLen=lengthBytesUTF8(info.description);WebGPU.setStringView(infoStruct+56,strPtr,descriptionLen);strPtr+=descriptionLen;(growMemViews(),HEAP32)[(infoStruct+72)/4]=2;var adapterType=info.isFallbackAdapter?3:4;(growMemViews(),HEAP32)[(infoStruct+76)/4]=adapterType;(growMemViews(),HEAPU32)[(infoStruct+80)/4]=0;(growMemViews(),HEAPU32)[(infoStruct+84)/4]=0},AddressMode:[,"clamp-to-edge","repeat","mirror-repeat"],BlendFactor:[,"zero","one","src","one-minus-src","src-alpha","one-minus-src-alpha","dst","one-minus-dst","dst-alpha","one-minus-dst-alpha","src-alpha-saturated","constant","one-minus-constant","src1","one-minus-src1","src1-alpha","one-minus-src1-alpha"],BlendOperation:[,"add","subtract","reverse-subtract","min","max"],BufferBindingType:[,,"uniform","storage","read-only-storage"],BufferMapState:[,"unmapped","pending","mapped"],CompareFunction:[,"never","less","equal","less-equal","greater","not-equal","greater-equal","always"],CompilationInfoRequestStatus:[,"success","callback-cancelled"],ComponentSwizzle:[,"0","1","r","g","b","a"],CompositeAlphaMode:[,"opaque","premultiplied","unpremultiplied","inherit"],CullMode:[,"none","front","back"],ErrorFilter:[,"validation","out-of-memory","internal"],FeatureLevel:[,"compatibility","core"],FeatureName:{1:"core-features-and-limits",2:"depth-clip-control",3:"depth32float-stencil8",4:"texture-compression-bc",5:"texture-compression-bc-sliced-3d",6:"texture-compression-etc2",7:"texture-compression-astc",8:"texture-compression-astc-sliced-3d",9:"timestamp-query",10:"indirect-first-instance",11:"shader-f16",12:"rg11b10ufloat-renderable",13:"bgra8unorm-storage",14:"float32-filterable",15:"float32-blendable",16:"clip-distances",17:"dual-source-blending",18:"subgroups",19:"texture-formats-tier1",20:"texture-formats-tier2",21:"primitive-index",22:"texture-component-swizzle",327692:"chromium-experimental-unorm16-texture-formats",327729:"chromium-experimental-multi-draw-indirect"},FilterMode:[,"nearest","linear"],FrontFace:[,"ccw","cw"],IndexFormat:[,"uint16","uint32"],InstanceFeatureName:[,"timed-wait-any","shader-source-spirv","multiple-devices-per-adapter"],LoadOp:[,"load","clear"],MipmapFilterMode:[,"nearest","linear"],OptionalBool:["false","true"],PowerPreference:[,"low-power","high-performance"],PredefinedColorSpace:[,"srgb","display-p3"],PrimitiveTopology:[,"point-list","line-list","line-strip","triangle-list","triangle-strip"],QueryType:[,"occlusion","timestamp"],SamplerBindingType:[,,"filtering","non-filtering","comparison"],Status:[,"success","error"],StencilOperation:[,"keep","zero","replace","invert","increment-clamp","decrement-clamp","increment-wrap","decrement-wrap"],StorageTextureAccess:[,,"write-only","read-only","read-write"],StoreOp:[,"store","discard"],SurfaceGetCurrentTextureStatus:[,"success-optimal","success-suboptimal","timeout","outdated","lost","error"],TextureAspect:[,"all","stencil-only","depth-only"],TextureDimension:[,"1d","2d","3d"],TextureFormat:[,"r8unorm","r8snorm","r8uint","r8sint","r16unorm","r16snorm","r16uint","r16sint","r16float","rg8unorm","rg8snorm","rg8uint","rg8sint","r32float","r32uint","r32sint","rg16unorm","rg16snorm","rg16uint","rg16sint","rg16float","rgba8unorm","rgba8unorm-srgb","rgba8snorm","rgba8uint","rgba8sint","bgra8unorm","bgra8unorm-srgb","rgb10a2uint","rgb10a2unorm","rg11b10ufloat","rgb9e5ufloat","rg32float","rg32uint","rg32sint","rgba16unorm","rgba16snorm","rgba16uint","rgba16sint","rgba16float","rgba32float","rgba32uint","rgba32sint","stencil8","depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8","bc1-rgba-unorm","bc1-rgba-unorm-srgb","bc2-rgba-unorm","bc2-rgba-unorm-srgb","bc3-rgba-unorm","bc3-rgba-unorm-srgb","bc4-r-unorm","bc4-r-snorm","bc5-rg-unorm","bc5-rg-snorm","bc6h-rgb-ufloat","bc6h-rgb-float","bc7-rgba-unorm","bc7-rgba-unorm-srgb","etc2-rgb8unorm","etc2-rgb8unorm-srgb","etc2-rgb8a1unorm","etc2-rgb8a1unorm-srgb","etc2-rgba8unorm","etc2-rgba8unorm-srgb","eac-r11unorm","eac-r11snorm","eac-rg11unorm","eac-rg11snorm","astc-4x4-unorm","astc-4x4-unorm-srgb","astc-5x4-unorm","astc-5x4-unorm-srgb","astc-5x5-unorm","astc-5x5-unorm-srgb","astc-6x5-unorm","astc-6x5-unorm-srgb","astc-6x6-unorm","astc-6x6-unorm-srgb","astc-8x5-unorm","astc-8x5-unorm-srgb","astc-8x6-unorm","astc-8x6-unorm-srgb","astc-8x8-unorm","astc-8x8-unorm-srgb","astc-10x5-unorm","astc-10x5-unorm-srgb","astc-10x6-unorm","astc-10x6-unorm-srgb","astc-10x8-unorm","astc-10x8-unorm-srgb","astc-10x10-unorm","astc-10x10-unorm-srgb","astc-12x10-unorm","astc-12x10-unorm-srgb","astc-12x12-unorm","astc-12x12-unorm-srgb"],TextureSampleType:[,,"float","unfilterable-float","depth","sint","uint"],TextureViewDimension:[,"1d","2d","2d-array","cube","cube-array","3d"],ToneMappingMode:[,"standard","extended"],VertexFormat:[,"uint8","uint8x2","uint8x4","sint8","sint8x2","sint8x4","unorm8","unorm8x2","unorm8x4","snorm8","snorm8x2","snorm8x4","uint16","uint16x2","uint16x4","sint16","sint16x2","sint16x4","unorm16","unorm16x2","unorm16x4","snorm16","snorm16x2","snorm16x4","float16","float16x2","float16x4","float32","float32x2","float32x3","float32x4","uint32","uint32x2","uint32x3","uint32x4","sint32","sint32x2","sint32x3","sint32x4","unorm10-10-10-2","unorm8x4-bgra"],VertexStepMode:[,"vertex","instance"],WGSLLanguageFeatureName:[,"readonly_and_readwrite_storage_textures","packed_4x8_integer_dot_product","unrestricted_pointer_parameters","pointer_composite_access","uniform_buffer_standard_layout","subgroup_id","texture_and_sampler_let","subgroup_uniformity","texture_formats_tier1"]};var emwgpuStringToInt_DeviceLostReason={undefined:1,unknown:1,destroyed:2};var runtimeKeepalivePop=()=>{runtimeKeepaliveCounter-=1};function _emwgpuAdapterRequestDevice(adapterPtr,futureId,deviceLostFutureId,devicePtr,queuePtr,descriptor){adapterPtr=bigintToI53Checked(adapterPtr);futureId=bigintToI53Checked(futureId);deviceLostFutureId=bigintToI53Checked(deviceLostFutureId);devicePtr=bigintToI53Checked(devicePtr);queuePtr=bigintToI53Checked(queuePtr);descriptor=bigintToI53Checked(descriptor);var adapter=WebGPU.getJsObject(adapterPtr);var desc={};if(descriptor){var requiredFeatureCount=Number((growMemViews(),HEAPU64)[(descriptor+24)/8]);if(requiredFeatureCount){var requiredFeaturesPtr=Number((growMemViews(),HEAPU64)[(descriptor+32)/8]);desc["requiredFeatures"]=Array.from((growMemViews(),HEAPU32).subarray(requiredFeaturesPtr/4,(requiredFeaturesPtr+requiredFeatureCount*4)/4),feature=>WebGPU.FeatureName[feature])}var limitsPtr=Number((growMemViews(),HEAPU64)[(descriptor+40)/8]);if(limitsPtr){var nextInChainPtr=Number((growMemViews(),HEAPU64)[limitsPtr/8]);var requiredLimits={};function setLimitU32IfDefined(name,basePtr,limitOffset,ignoreIfZero=false){var ptr=basePtr+limitOffset;var value=(growMemViews(),HEAPU32)[ptr/4];if(value!=4294967295&&(!ignoreIfZero||value!=0)){requiredLimits[name]=value}}function setLimitU64IfDefined(name,basePtr,limitOffset){var ptr=basePtr+limitOffset;var limitPart1=(growMemViews(),HEAPU32)[ptr/4];var limitPart2=(growMemViews(),HEAPU32)[(ptr+4)/4];if(limitPart1!=4294967295||limitPart2!=4294967295){requiredLimits[name]=readI53FromI64(ptr)}}setLimitU32IfDefined("maxTextureDimension1D",limitsPtr,8);setLimitU32IfDefined("maxTextureDimension2D",limitsPtr,12);setLimitU32IfDefined("maxTextureDimension3D",limitsPtr,16);setLimitU32IfDefined("maxTextureArrayLayers",limitsPtr,20);setLimitU32IfDefined("maxBindGroups",limitsPtr,24);setLimitU32IfDefined("maxBindGroupsPlusVertexBuffers",limitsPtr,28);setLimitU32IfDefined("maxBindingsPerBindGroup",limitsPtr,32);setLimitU32IfDefined("maxDynamicUniformBuffersPerPipelineLayout",limitsPtr,36);setLimitU32IfDefined("maxDynamicStorageBuffersPerPipelineLayout",limitsPtr,40);setLimitU32IfDefined("maxSampledTexturesPerShaderStage",limitsPtr,44);setLimitU32IfDefined("maxSamplersPerShaderStage",limitsPtr,48);setLimitU32IfDefined("maxStorageBuffersPerShaderStage",limitsPtr,52);setLimitU32IfDefined("maxStorageTexturesPerShaderStage",limitsPtr,56);setLimitU32IfDefined("maxUniformBuffersPerShaderStage",limitsPtr,60);setLimitU32IfDefined("minUniformBufferOffsetAlignment",limitsPtr,80);setLimitU32IfDefined("minStorageBufferOffsetAlignment",limitsPtr,84);setLimitU64IfDefined("maxUniformBufferBindingSize",limitsPtr,64);setLimitU64IfDefined("maxStorageBufferBindingSize",limitsPtr,72);setLimitU32IfDefined("maxVertexBuffers",limitsPtr,88);setLimitU64IfDefined("maxBufferSize",limitsPtr,96);setLimitU32IfDefined("maxVertexAttributes",limitsPtr,104);setLimitU32IfDefined("maxVertexBufferArrayStride",limitsPtr,108);setLimitU32IfDefined("maxInterStageShaderVariables",limitsPtr,112);setLimitU32IfDefined("maxColorAttachments",limitsPtr,116);setLimitU32IfDefined("maxColorAttachmentBytesPerSample",limitsPtr,120);setLimitU32IfDefined("maxComputeWorkgroupStorageSize",limitsPtr,124);setLimitU32IfDefined("maxComputeInvocationsPerWorkgroup",limitsPtr,128);setLimitU32IfDefined("maxComputeWorkgroupSizeX",limitsPtr,132);setLimitU32IfDefined("maxComputeWorkgroupSizeY",limitsPtr,136);setLimitU32IfDefined("maxComputeWorkgroupSizeZ",limitsPtr,140);setLimitU32IfDefined("maxComputeWorkgroupsPerDimension",limitsPtr,144);setLimitU32IfDefined("maxImmediateSize",limitsPtr,148,true);if(nextInChainPtr!==0){var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var compatibilityModeLimitsPtr=nextInChainPtr;if("maxStorageBuffersInVertexStage"in GPUSupportedLimits.prototype){setLimitU32IfDefined("maxStorageBuffersInVertexStage",compatibilityModeLimitsPtr,16);setLimitU32IfDefined("maxStorageTexturesInVertexStage",compatibilityModeLimitsPtr,20);setLimitU32IfDefined("maxStorageBuffersInFragmentStage",compatibilityModeLimitsPtr,24);setLimitU32IfDefined("maxStorageTexturesInFragmentStage",compatibilityModeLimitsPtr,28)}}desc["requiredLimits"]=requiredLimits}var defaultQueuePtr=Number((growMemViews(),HEAPU64)[(descriptor+48)/8]);if(defaultQueuePtr){var defaultQueueDesc={label:WebGPU.makeStringFromOptionalStringView(defaultQueuePtr+8)};desc["defaultQueue"]=defaultQueueDesc}desc["label"]=WebGPU.makeStringFromOptionalStringView(descriptor+8)}runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,adapter.requestDevice(desc).then(device=>{runtimeKeepalivePop();callUserCallback(()=>{WebGPU.Internals.jsObjectInsert(queuePtr,device.queue);WebGPU.Internals.jsObjectInsert(devicePtr,device);devicePtr=BigInt(devicePtr);WebGPU.Internals.futureInsert(deviceLostFutureId,device.lost.then(info=>{callUserCallback(()=>{device.onuncapturederror=ev=>{};var sp=stackSave();var messagePtr=stringToUTF8OnStack(info.message);_emwgpuOnDeviceLostCompleted(deviceLostFutureId,emwgpuStringToInt_DeviceLostReason[info.reason],BigInt(messagePtr));stackRestore(sp)})}));device.onuncapturederror=ev=>{var type=5;if(ev.error instanceof GPUValidationError)type=2;else if(ev.error instanceof GPUOutOfMemoryError)type=3;else if(ev.error instanceof GPUInternalError)type=4;var sp=stackSave();var messagePtr=stringToUTF8OnStack(ev.error.message);_emwgpuOnUncapturedError(BigInt(devicePtr),type,BigInt(messagePtr));stackRestore(sp)};_emwgpuOnRequestDeviceCompleted(futureId,1,BigInt(devicePtr),0n)})},ex=>{runtimeKeepalivePop();callUserCallback(()=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(ex.message);_emwgpuOnRequestDeviceCompleted(futureId,3,BigInt(devicePtr),BigInt(messagePtr));if(deviceLostFutureId){_emwgpuOnDeviceLostCompleted(deviceLostFutureId,4,BigInt(messagePtr))}stackRestore(sp)})}))}function _emwgpuBufferDestroy(bufferPtr){bufferPtr=bigintToI53Checked(bufferPtr);var buffer=WebGPU.getJsObject(bufferPtr);var onUnmap=WebGPU.Internals.bufferOnUnmaps[bufferPtr];if(onUnmap){for(var i=0;i<onUnmap.length;++i){onUnmap[i]()}delete WebGPU.Internals.bufferOnUnmaps[bufferPtr]}buffer.destroy()}var warnOnce=text=>{warnOnce.shown||={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;if(ENVIRONMENT_IS_NODE)text="warning: "+text;err(text)}};var _emwgpuBufferGetConstMappedRange=function(bufferPtr,offset,size){bufferPtr=bigintToI53Checked(bufferPtr);offset=bigintToI53Checked(offset);size=bigintToI53Checked(size);var ret=(()=>{var buffer=WebGPU.getJsObject(bufferPtr);if(size==-1)size=undefined;var mapped;try{mapped=buffer.getMappedRange(offset,size)}catch(ex){return 0n}var data=_memalign(16,mapped.byteLength);(growMemViews(),HEAPU8).set(new Uint8Array(mapped),data);WebGPU.Internals.bufferOnUnmaps[bufferPtr].push(()=>_free(data));return data})();return BigInt(ret)};var _emwgpuBufferMapAsync=function(bufferPtr,futureId,mode,offset,size){bufferPtr=bigintToI53Checked(bufferPtr);futureId=bigintToI53Checked(futureId);mode=bigintToI53Checked(mode);offset=bigintToI53Checked(offset);size=bigintToI53Checked(size);var buffer=WebGPU.getJsObject(bufferPtr);WebGPU.Internals.bufferOnUnmaps[bufferPtr]=[];if(size==-1)size=undefined;runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,buffer.mapAsync(mode,offset,size).then(()=>{runtimeKeepalivePop();callUserCallback(()=>{_emwgpuOnMapAsyncCompleted(futureId,1,0n)})},ex=>{runtimeKeepalivePop();callUserCallback(()=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(ex.message);var status=ex.name==="AbortError"?4:ex.name==="OperationError"?3:0;_emwgpuOnMapAsyncCompleted(futureId,status,BigInt(messagePtr));delete WebGPU.Internals.bufferOnUnmaps[bufferPtr]})}))};function _emwgpuBufferUnmap(bufferPtr){bufferPtr=bigintToI53Checked(bufferPtr);var buffer=WebGPU.getJsObject(bufferPtr);var onUnmap=WebGPU.Internals.bufferOnUnmaps[bufferPtr];if(!onUnmap){return}for(var i=0;i<onUnmap.length;++i){onUnmap[i]()}delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];buffer.unmap()}function _emwgpuDelete(ptr){ptr=bigintToI53Checked(ptr);delete WebGPU.Internals.jsObjects[ptr]}function _emwgpuDeviceCreateBuffer(devicePtr,descriptor,bufferPtr){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);bufferPtr=bigintToI53Checked(bufferPtr);var mappedAtCreation=!!(growMemViews(),HEAPU32)[(descriptor+40)/4];var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),usage:(growMemViews(),HEAPU32)[(descriptor+24)/4],size:readI53FromI64(descriptor+32),mappedAtCreation};var device=WebGPU.getJsObject(devicePtr);var buffer;try{buffer=device.createBuffer(desc)}catch(ex){return false}WebGPU.Internals.jsObjectInsert(bufferPtr,buffer);if(mappedAtCreation){WebGPU.Internals.bufferOnUnmaps[bufferPtr]=[]}return true}function _emwgpuDeviceCreateShaderModule(devicePtr,descriptor,shaderModulePtr){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);shaderModulePtr=bigintToI53Checked(shaderModulePtr);var nextInChainPtr=Number((growMemViews(),HEAPU64)[descriptor/8]);var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),code:""};switch(sType){case 2:{desc["code"]=WebGPU.makeStringFromStringView(nextInChainPtr+16);break}}var device=WebGPU.getJsObject(devicePtr);WebGPU.Internals.jsObjectInsert(shaderModulePtr,device.createShaderModule(desc))}var _emwgpuDeviceDestroy=devicePtr=>{const device=WebGPU.getJsObject(devicePtr);device.onuncapturederror=null;device.destroy()};function _emwgpuInstanceRequestAdapter(instancePtr,futureId,options,adapterPtr){instancePtr=bigintToI53Checked(instancePtr);futureId=bigintToI53Checked(futureId);options=bigintToI53Checked(options);adapterPtr=bigintToI53Checked(adapterPtr);var opts;if(options){opts={featureLevel:WebGPU.FeatureLevel[(growMemViews(),HEAP32)[(options+8)/4]],powerPreference:WebGPU.PowerPreference[(growMemViews(),HEAP32)[(options+12)/4]],forceFallbackAdapter:!!(growMemViews(),HEAPU32)[(options+16)/4]};var nextInChainPtr=Number((growMemViews(),HEAPU64)[options/8]);if(nextInChainPtr!==0){var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var webxrOptions=nextInChainPtr;opts.xrCompatible=!!(growMemViews(),HEAPU32)[(webxrOptions+16)/4]}}if(!("gpu"in navigator)){var sp=stackSave();var messagePtr=stringToUTF8OnStack("WebGPU not available on this browser (navigator.gpu is not available)");_emwgpuOnRequestAdapterCompleted(futureId,3,BigInt(adapterPtr),BigInt(messagePtr));stackRestore(sp);return}runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,navigator.gpu.requestAdapter(opts).then(adapter=>{runtimeKeepalivePop();callUserCallback(()=>{if(adapter){WebGPU.Internals.jsObjectInsert(adapterPtr,adapter);_emwgpuOnRequestAdapterCompleted(futureId,1,BigInt(adapterPtr),0n)}else{var sp=stackSave();var messagePtr=stringToUTF8OnStack("WebGPU not available on this browser (requestAdapter returned null)");_emwgpuOnRequestAdapterCompleted(futureId,3,BigInt(adapterPtr),BigInt(messagePtr));stackRestore(sp)}})},ex=>{runtimeKeepalivePop();callUserCallback(()=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(ex.message);_emwgpuOnRequestAdapterCompleted(futureId,4,BigInt(adapterPtr),BigInt(messagePtr));stackRestore(sp)})}))}var _emwgpuQueueOnSubmittedWorkDone=function(queuePtr,futureId){queuePtr=bigintToI53Checked(queuePtr);futureId=bigintToI53Checked(futureId);var queue=WebGPU.getJsObject(queuePtr);runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,queue.onSubmittedWorkDone().then(()=>{runtimeKeepalivePop();callUserCallback(()=>{_emwgpuOnWorkDoneCompleted(futureId,1)})}))};var _emwgpuWaitAny=function(futurePtr,futureCount,timeoutMSPtr){futurePtr=bigintToI53Checked(futurePtr);futureCount=bigintToI53Checked(futureCount);timeoutMSPtr=bigintToI53Checked(timeoutMSPtr);return Asyncify.handleAsync(async()=>{var promises=[];if(timeoutMSPtr){var timeoutMS=(growMemViews(),HEAP32)[timeoutMSPtr/4];promises.length=futureCount+1;promises[futureCount]=new Promise(resolve=>setTimeout(resolve,timeoutMS,0))}else{promises.length=futureCount}for(var i=0;i<futureCount;++i){var futureId=readI53FromI64(futurePtr+i*8);if(!(futureId in WebGPU.Internals.futures)){return futureId}promises[i]=WebGPU.Internals.futures[futureId]}const firstResolvedFuture=await Promise.race(promises);delete WebGPU.Internals.futures[firstResolvedFuture];return firstResolvedFuture})};_emwgpuWaitAny.isAsync=true;var ENV={};var getExecutableName=()=>thisProgram||"./this.program";var getEnvStrings=()=>{if(!getEnvStrings.strings){var lang=(typeof navigator=="object"&&navigator.language||"C").replace("-","_")+".UTF-8";var env={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:lang,_:getExecutableName()};for(var x in ENV){if(ENV[x]===undefined)delete env[x];else env[x]=ENV[x]}var strings=[];for(var x in env){strings.push(`${x}=${env[x]}`)}getEnvStrings.strings=strings}return getEnvStrings.strings};function _environ_get(__environ,environ_buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(14,0,1,__environ,environ_buf);__environ=bigintToI53Checked(__environ);environ_buf=bigintToI53Checked(environ_buf);var bufSize=0;var envp=0;for(var string of getEnvStrings()){var ptr=environ_buf+bufSize;(growMemViews(),HEAPU64)[(__environ+envp)/8]=BigInt(ptr);bufSize+=stringToUTF8(string,ptr,Infinity)+1;envp+=8}return 0}function _environ_sizes_get(penviron_count,penviron_buf_size){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(15,0,1,penviron_count,penviron_buf_size);penviron_count=bigintToI53Checked(penviron_count);penviron_buf_size=bigintToI53Checked(penviron_buf_size);var strings=getEnvStrings();(growMemViews(),HEAPU64)[penviron_count/8]=BigInt(strings.length);var bufSize=0;for(var string of strings){bufSize+=lengthBytesUTF8(string)+1}(growMemViews(),HEAPU64)[penviron_buf_size/8]=BigInt(bufSize);return 0}function _fd_close(fd){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(16,0,1,fd);try{var stream=SYSCALLS.getStreamFromFD(fd);FS.close(stream);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doReadv=(stream,iov,iovcnt,offset)=>{var ret=0;for(var i=0;i<iovcnt;i++){var ptr=Number((growMemViews(),HEAPU64)[iov/8]);var len=Number((growMemViews(),HEAPU64)[(iov+8)/8]);iov+=16;var curr=FS.read(stream,(growMemViews(),HEAP8),ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len)break;if(typeof offset!="undefined"){offset+=curr}}return ret};function _fd_read(fd,iov,iovcnt,pnum){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(17,0,1,fd,iov,iovcnt,pnum);iov=bigintToI53Checked(iov);iovcnt=bigintToI53Checked(iovcnt);pnum=bigintToI53Checked(pnum);try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doReadv(stream,iov,iovcnt);(growMemViews(),HEAPU64)[pnum/8]=BigInt(num);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _fd_seek(fd,offset,whence,newOffset){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(18,0,1,fd,offset,whence,newOffset);offset=bigintToI53Checked(offset);newOffset=bigintToI53Checked(newOffset);try{if(isNaN(offset))return 61;var stream=SYSCALLS.getStreamFromFD(fd);FS.llseek(stream,offset,whence);(growMemViews(),HEAP64)[newOffset/8]=BigInt(stream.position);if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doWritev=(stream,iov,iovcnt,offset)=>{var ret=0;for(var i=0;i<iovcnt;i++){var ptr=Number((growMemViews(),HEAPU64)[iov/8]);var len=Number((growMemViews(),HEAPU64)[(iov+8)/8]);iov+=16;var curr=FS.write(stream,(growMemViews(),HEAP8),ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len){break}if(typeof offset!="undefined"){offset+=curr}}return ret};function _fd_write(fd,iov,iovcnt,pnum){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(19,0,1,fd,iov,iovcnt,pnum);iov=bigintToI53Checked(iov);iovcnt=bigintToI53Checked(iovcnt);pnum=bigintToI53Checked(pnum);try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doWritev(stream,iov,iovcnt);(growMemViews(),HEAPU64)[pnum/8]=BigInt(num);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _random_get(buffer,size){buffer=bigintToI53Checked(buffer);size=bigintToI53Checked(size);try{randomFill((growMemViews(),HEAPU8).subarray(buffer,buffer+size));return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _wgpuAdapterGetInfo(adapterPtr,info){adapterPtr=bigintToI53Checked(adapterPtr);info=bigintToI53Checked(info);var adapter=WebGPU.getJsObject(adapterPtr);WebGPU.fillAdapterInfoStruct(adapter.info,info);return 1}function _wgpuAdapterGetLimits(adapterPtr,limitsOutPtr){adapterPtr=bigintToI53Checked(adapterPtr);limitsOutPtr=bigintToI53Checked(limitsOutPtr);var adapter=WebGPU.getJsObject(adapterPtr);WebGPU.fillLimitStruct(adapter.limits,limitsOutPtr);return 1}function _wgpuAdapterHasFeature(adapterPtr,featureEnumValue){adapterPtr=bigintToI53Checked(adapterPtr);var adapter=WebGPU.getJsObject(adapterPtr);return adapter.features.has(WebGPU.FeatureName[featureEnumValue])}var _wgpuBufferGetSize=function(bufferPtr){bufferPtr=bigintToI53Checked(bufferPtr);var ret=(()=>{var buffer=WebGPU.getJsObject(bufferPtr);return buffer.size})();return BigInt(ret)};var _wgpuCommandEncoderBeginComputePass=function(encoderPtr,descriptor){encoderPtr=bigintToI53Checked(encoderPtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var desc;if(descriptor){desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),timestampWrites:WebGPU.makePassTimestampWrites(Number((growMemViews(),HEAPU64)[(descriptor+24)/8]))}}var commandEncoder=WebGPU.getJsObject(encoderPtr);var ptr=_emwgpuCreateComputePassEncoder(0n);WebGPU.Internals.jsObjectInsert(ptr,commandEncoder.beginComputePass(desc));return ptr})();return BigInt(ret)};function _wgpuCommandEncoderCopyBufferToBuffer(encoderPtr,srcPtr,srcOffset,dstPtr,dstOffset,size){encoderPtr=bigintToI53Checked(encoderPtr);srcPtr=bigintToI53Checked(srcPtr);srcOffset=bigintToI53Checked(srcOffset);dstPtr=bigintToI53Checked(dstPtr);dstOffset=bigintToI53Checked(dstOffset);size=bigintToI53Checked(size);var commandEncoder=WebGPU.getJsObject(encoderPtr);var src=WebGPU.getJsObject(srcPtr);var dst=WebGPU.getJsObject(dstPtr);commandEncoder.copyBufferToBuffer(src,srcOffset,dst,dstOffset,size)}var _wgpuCommandEncoderFinish=function(encoderPtr,descriptor){encoderPtr=bigintToI53Checked(encoderPtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var commandEncoder=WebGPU.getJsObject(encoderPtr);var ptr=_emwgpuCreateCommandBuffer(0n);WebGPU.Internals.jsObjectInsert(ptr,commandEncoder.finish());return ptr})();return BigInt(ret)};function _wgpuComputePassEncoderDispatchWorkgroups(passPtr,x,y,z){passPtr=bigintToI53Checked(passPtr);var pass=WebGPU.getJsObject(passPtr);pass.dispatchWorkgroups(x,y,z)}function _wgpuComputePassEncoderEnd(passPtr){passPtr=bigintToI53Checked(passPtr);var pass=WebGPU.getJsObject(passPtr);pass.end()}function _wgpuComputePassEncoderSetBindGroup(passPtr,groupIndex,groupPtr,dynamicOffsetCount,dynamicOffsetsPtr){passPtr=bigintToI53Checked(passPtr);groupPtr=bigintToI53Checked(groupPtr);dynamicOffsetCount=bigintToI53Checked(dynamicOffsetCount);dynamicOffsetsPtr=bigintToI53Checked(dynamicOffsetsPtr);var pass=WebGPU.getJsObject(passPtr);var group=WebGPU.getJsObject(groupPtr);if(dynamicOffsetCount==0){pass.setBindGroup(groupIndex,group)}else{pass.setBindGroup(groupIndex,group,(growMemViews(),HEAPU32),dynamicOffsetsPtr/4,dynamicOffsetCount)}}function _wgpuComputePassEncoderSetPipeline(passPtr,pipelinePtr){passPtr=bigintToI53Checked(passPtr);pipelinePtr=bigintToI53Checked(pipelinePtr);var pass=WebGPU.getJsObject(passPtr);var pipeline=WebGPU.getJsObject(pipelinePtr);pass.setPipeline(pipeline)}var _wgpuComputePipelineGetBindGroupLayout=function(pipelinePtr,groupIndex){pipelinePtr=bigintToI53Checked(pipelinePtr);var ret=(()=>{var pipeline=WebGPU.getJsObject(pipelinePtr);var ptr=_emwgpuCreateBindGroupLayout(0n);WebGPU.Internals.jsObjectInsert(ptr,pipeline.getBindGroupLayout(groupIndex));return ptr})();return BigInt(ret)};var _wgpuDeviceCreateBindGroup=function(devicePtr,descriptor){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{function makeEntry(entryPtr){var bufferPtr=Number((growMemViews(),HEAPU64)[(entryPtr+16)/8]);var samplerPtr=Number((growMemViews(),HEAPU64)[(entryPtr+40)/8]);var textureViewPtr=Number((growMemViews(),HEAPU64)[(entryPtr+48)/8]);var externalTexturePtr=0;WebGPU.iterateExtensions(entryPtr,{327681:ptr=>{externalTexturePtr=Number((growMemViews(),HEAPU64)[(ptr+16)/8])}});var resource;if(bufferPtr){var size=readI53FromI64(entryPtr+32);if(size==-1)size=undefined;resource={buffer:WebGPU.getJsObject(bufferPtr),offset:readI53FromI64(entryPtr+24),size}}else{resource=WebGPU.getJsObject(samplerPtr||textureViewPtr||externalTexturePtr)}return{binding:(growMemViews(),HEAPU32)[(entryPtr+8)/4],resource}}function makeEntries(count,entriesPtrs){var entries=[];for(var i=0;i<count;++i){entries.push(makeEntry(entriesPtrs+56*i))}return entries}var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),layout:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(descriptor+24)/8])),entries:makeEntries(Number((growMemViews(),HEAPU64)[(descriptor+32)/8]),Number((growMemViews(),HEAPU64)[(descriptor+40)/8]))};var device=WebGPU.getJsObject(devicePtr);var ptr=_emwgpuCreateBindGroup(0n);WebGPU.Internals.jsObjectInsert(ptr,device.createBindGroup(desc));return ptr})();return BigInt(ret)};var _wgpuDeviceCreateCommandEncoder=function(devicePtr,descriptor){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var desc;if(descriptor){desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8)}}var device=WebGPU.getJsObject(devicePtr);var ptr=_emwgpuCreateCommandEncoder(0n);WebGPU.Internals.jsObjectInsert(ptr,device.createCommandEncoder(desc));return ptr})();return BigInt(ret)};var _wgpuDeviceCreateComputePipeline=function(devicePtr,descriptor){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var desc=WebGPU.makeComputePipelineDesc(descriptor);var device=WebGPU.getJsObject(devicePtr);var ptr=_emwgpuCreateComputePipeline(0n);WebGPU.Internals.jsObjectInsert(ptr,device.createComputePipeline(desc));return ptr})();return BigInt(ret)};function _wgpuInstanceHasWGSLLanguageFeature(instance,featureEnumValue){instance=bigintToI53Checked(instance);if(!("wgslLanguageFeatures"in navigator.gpu)){return false}return navigator.gpu.wgslLanguageFeatures.has(WebGPU.WGSLLanguageFeatureName[featureEnumValue])}var _wgpuQueueSubmit=function(queuePtr,commandCount,commands){queuePtr=bigintToI53Checked(queuePtr);commandCount=bigintToI53Checked(commandCount);commands=bigintToI53Checked(commands);var queue=WebGPU.getJsObject(queuePtr);var cmds=Array.from((growMemViews(),HEAP64).subarray(commands/8,(commands+commandCount*8)/8),id=>WebGPU.getJsObject(id));queue.submit(cmds)};function _wgpuQueueWriteBuffer(queuePtr,bufferPtr,bufferOffset,data,size){queuePtr=bigintToI53Checked(queuePtr);bufferPtr=bigintToI53Checked(bufferPtr);bufferOffset=bigintToI53Checked(bufferOffset);data=bigintToI53Checked(data);size=bigintToI53Checked(size);var queue=WebGPU.getJsObject(queuePtr);var buffer=WebGPU.getJsObject(bufferPtr);var subarray=(growMemViews(),HEAPU8).subarray(data,data+size);queue.writeBuffer(buffer,bufferOffset,subarray,0,size)}var Asyncify={instrumentWasmImports(imports){var importPattern=/^(invoke_.*|__asyncjs__.*)$/;for(let[x,original]of Object.entries(imports)){if(typeof original=="function"){let isAsyncifyImport=original.isAsync||importPattern.test(x);if(isAsyncifyImport){imports[x]=original=new WebAssembly.Suspending(original)}}}},instrumentFunction(original){var wrapper=(...args)=>original(...args);return wrapper},instrumentWasmExports(exports){var exportPattern=/^(wllama_start|wllama_action|main|__main_argc_argv)$/;Asyncify.asyncExports=new Set;var ret={};for(let[x,original]of Object.entries(exports)){if(typeof original=="function"){let isAsyncifyExport=exportPattern.test(x);if(isAsyncifyExport){Asyncify.asyncExports.add(original);original=Asyncify.makeAsyncFunction(original)}var wrapper=Asyncify.instrumentFunction(original);ret[x]=wrapper}else{ret[x]=original}}return ret},asyncExports:null,isAsyncExport(func){return Asyncify.asyncExports?.has(func)},handleAsync:async startAsync=>{runtimeKeepalivePush();try{return await startAsync()}finally{runtimeKeepalivePop()}},handleSleep:startAsync=>Asyncify.handleAsync(()=>new Promise(startAsync)),makeAsyncFunction(original){return WebAssembly.promising(original)}};var getCFunc=ident=>{var func=Module["_"+ident];return func};var writeArrayToMemory=(array,buffer)=>{(growMemViews(),HEAP8).set(array,buffer)};var ccall=(ident,returnType,argTypes,args,opts)=>{var toC={pointer:p=>BigInt(p),string:str=>{var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=stringToUTF8OnStack(str)}return BigInt(ret)},array:arr=>{var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return BigInt(ret)}};function convertReturnValue(ret){if(returnType==="string"){return UTF8ToString(Number(ret))}if(returnType==="pointer")return Number(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func(...cArgs);function onDone(ret){if(stack!==0)stackRestore(stack);return convertReturnValue(ret)}var asyncMode=opts?.async;if(asyncMode)return ret.then(onDone);ret=onDone(ret);return ret};var cwrap=(ident,returnType,argTypes,opts)=>{var numericArgs=!argTypes||argTypes.every(type=>type==="number"||type==="boolean");var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return(...args)=>ccall(ident,returnType,argTypes,args,opts)};var FS_createPath=(...args)=>FS.createPath(...args);var FS_unlink=(...args)=>FS.unlink(...args);var FS_createLazyFile=(...args)=>FS.createLazyFile(...args);var FS_createDevice=(...args)=>FS.createDevice(...args);PThread.init();FS.createPreloadedFile=FS_createPreloadedFile;FS.preloadFile=FS_preloadFile;FS.staticInit();{initMemory();if(Module["noExitRuntime"])noExitRuntime=Module["noExitRuntime"];if(Module["preloadPlugins"])preloadPlugins=Module["preloadPlugins"];if(Module["print"])out=Module["print"];if(Module["printErr"])err=Module["printErr"];if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].shift()()}}}Module["ENV"]=ENV;Module["mmapAlloc"]=mmapAlloc;Module["wasmMemory"]=wasmMemory;Module["addRunDependency"]=addRunDependency;Module["removeRunDependency"]=removeRunDependency;Module["ccall"]=ccall;Module["cwrap"]=cwrap;Module["FS_preloadFile"]=FS_preloadFile;Module["FS_unlink"]=FS_unlink;Module["FS_createPath"]=FS_createPath;Module["FS_createDevice"]=FS_createDevice;Module["FS"]=FS;Module["FS_createDataFile"]=FS_createDataFile;Module["FS_createLazyFile"]=FS_createLazyFile;Module["MEMFS"]=MEMFS;var proxiedFunctionTable=[_proc_exit,exitOnMainThread,pthreadCreateProxied,___syscall_fcntl64,___syscall_fstat64,___syscall_getcwd,___syscall_getdents64,___syscall_ioctl,___syscall_lstat64,___syscall_newfstatat,___syscall_openat,___syscall_stat64,__mmap_js,__munmap_js,_environ_get,_environ_sizes_get,_fd_close,_fd_read,_fd_seek,_fd_write];function __asyncjs__js_file_read(path_ptr,offset,req_size,out_ptr){return Asyncify.handleAsync(async()=>await _wllama_js_file_read(UTF8ToString(Number(path_ptr)),Number(offset),Number(req_size),Number(out_ptr)))}__asyncjs__js_file_read.sig="jjjjj";var _malloc,_free,_wllama_malloc,_wllama_start,_wllama_action,_wllama_exit,_wllama_debug,_main,_emwgpuCreateBindGroup,_emwgpuCreateBindGroupLayout,_emwgpuCreateCommandBuffer,_emwgpuCreateCommandEncoder,_emwgpuCreateComputePassEncoder,_emwgpuCreateComputePipeline,_emwgpuCreateExternalTexture,_emwgpuCreatePipelineLayout,_emwgpuCreateQuerySet,_emwgpuCreateRenderBundle,_emwgpuCreateRenderBundleEncoder,_emwgpuCreateRenderPassEncoder,_emwgpuCreateRenderPipeline,_emwgpuCreateSampler,_emwgpuCreateSurface,_emwgpuCreateTexture,_emwgpuCreateTextureView,_emwgpuCreateAdapter,_emwgpuCreateBuffer,_emwgpuCreateDevice,_emwgpuCreateQueue,_emwgpuCreateShaderModule,_emwgpuOnDeviceLostCompleted,_emwgpuOnMapAsyncCompleted,_emwgpuOnRequestAdapterCompleted,_emwgpuOnRequestDeviceCompleted,_emwgpuOnWorkDoneCompleted,_emwgpuOnUncapturedError,__emscripten_tls_init,_pthread_self,_emscripten_builtin_memalign,__emscripten_thread_init,__emscripten_thread_crashed,__emscripten_run_js_on_main_thread,__emscripten_thread_free_data,__emscripten_thread_exit,__emscripten_check_mailbox,_memalign,___trap,_emscripten_stack_set_limits,__emscripten_stack_restore,__emscripten_stack_alloc,_emscripten_stack_get_current,__indirect_function_table,wasmTable;function assignWasmExports(wasmExports){_malloc=wasmExports["malloc"];_free=wasmExports["free"];_wllama_malloc=Module["_wllama_malloc"]=wasmExports["wllama_malloc"];_wllama_start=Module["_wllama_start"]=wasmExports["wllama_start"];_wllama_action=Module["_wllama_action"]=wasmExports["wllama_action"];_wllama_exit=Module["_wllama_exit"]=wasmExports["wllama_exit"];_wllama_debug=Module["_wllama_debug"]=wasmExports["wllama_debug"];_main=Module["_main"]=wasmExports["main"];_emwgpuCreateBindGroup=wasmExports["emwgpuCreateBindGroup"];_emwgpuCreateBindGroupLayout=wasmExports["emwgpuCreateBindGroupLayout"];_emwgpuCreateCommandBuffer=wasmExports["emwgpuCreateCommandBuffer"];_emwgpuCreateCommandEncoder=wasmExports["emwgpuCreateCommandEncoder"];_emwgpuCreateComputePassEncoder=wasmExports["emwgpuCreateComputePassEncoder"];_emwgpuCreateComputePipeline=wasmExports["emwgpuCreateComputePipeline"];_emwgpuCreateExternalTexture=wasmExports["emwgpuCreateExternalTexture"];_emwgpuCreatePipelineLayout=wasmExports["emwgpuCreatePipelineLayout"];_emwgpuCreateQuerySet=wasmExports["emwgpuCreateQuerySet"];_emwgpuCreateRenderBundle=wasmExports["emwgpuCreateRenderBundle"];_emwgpuCreateRenderBundleEncoder=wasmExports["emwgpuCreateRenderBundleEncoder"];_emwgpuCreateRenderPassEncoder=wasmExports["emwgpuCreateRenderPassEncoder"];_emwgpuCreateRenderPipeline=wasmExports["emwgpuCreateRenderPipeline"];_emwgpuCreateSampler=wasmExports["emwgpuCreateSampler"];_emwgpuCreateSurface=wasmExports["emwgpuCreateSurface"];_emwgpuCreateTexture=wasmExports["emwgpuCreateTexture"];_emwgpuCreateTextureView=wasmExports["emwgpuCreateTextureView"];_emwgpuCreateAdapter=wasmExports["emwgpuCreateAdapter"];_emwgpuCreateBuffer=wasmExports["emwgpuCreateBuffer"];_emwgpuCreateDevice=wasmExports["emwgpuCreateDevice"];_emwgpuCreateQueue=wasmExports["emwgpuCreateQueue"];_emwgpuCreateShaderModule=wasmExports["emwgpuCreateShaderModule"];_emwgpuOnDeviceLostCompleted=wasmExports["emwgpuOnDeviceLostCompleted"];_emwgpuOnMapAsyncCompleted=wasmExports["emwgpuOnMapAsyncCompleted"];_emwgpuOnRequestAdapterCompleted=wasmExports["emwgpuOnRequestAdapterCompleted"];_emwgpuOnRequestDeviceCompleted=wasmExports["emwgpuOnRequestDeviceCompleted"];_emwgpuOnWorkDoneCompleted=wasmExports["emwgpuOnWorkDoneCompleted"];_emwgpuOnUncapturedError=wasmExports["emwgpuOnUncapturedError"];__emscripten_tls_init=wasmExports["_emscripten_tls_init"];_pthread_self=wasmExports["pthread_self"];_emscripten_builtin_memalign=wasmExports["emscripten_builtin_memalign"];__emscripten_thread_init=wasmExports["_emscripten_thread_init"];__emscripten_thread_crashed=wasmExports["_emscripten_thread_crashed"];__emscripten_run_js_on_main_thread=wasmExports["_emscripten_run_js_on_main_thread"];__emscripten_thread_free_data=wasmExports["_emscripten_thread_free_data"];__emscripten_thread_exit=wasmExports["_emscripten_thread_exit"];__emscripten_check_mailbox=wasmExports["_emscripten_check_mailbox"];_memalign=wasmExports["memalign"];___trap=wasmExports["__trap"];_emscripten_stack_set_limits=wasmExports["emscripten_stack_set_limits"];__emscripten_stack_restore=wasmExports["_emscripten_stack_restore"];__emscripten_stack_alloc=wasmExports["_emscripten_stack_alloc"];_emscripten_stack_get_current=wasmExports["emscripten_stack_get_current"];__indirect_function_table=wasmTable=wasmExports["__indirect_function_table"]}var wasmImports;function assignWasmImports(){wasmImports={__asyncjs__js_file_read,__pthread_create_js:___pthread_create_js,__syscall_fcntl64:___syscall_fcntl64,__syscall_getcwd:___syscall_getcwd,__syscall_getdents64:___syscall_getdents64,__syscall_ioctl:___syscall_ioctl,__syscall_openat:___syscall_openat,__syscall_stat64:___syscall_stat64,_abort_js:__abort_js,_emscripten_init_main_thread_js:__emscripten_init_main_thread_js,_emscripten_notify_mailbox_postmessage:__emscripten_notify_mailbox_postmessage,_emscripten_receive_on_main_thread_js:__emscripten_receive_on_main_thread_js,_emscripten_thread_cleanup:__emscripten_thread_cleanup,_emscripten_thread_mailbox_await:__emscripten_thread_mailbox_await,_emscripten_thread_set_strongref:__emscripten_thread_set_strongref,_localtime_js:__localtime_js,_mmap_js:__mmap_js,_munmap_js:__munmap_js,_tzset_js:__tzset_js,clock_time_get:_clock_time_get,emscripten_check_blocking_allowed:_emscripten_check_blocking_allowed,emscripten_date_now:_emscripten_date_now,emscripten_exit_with_live_runtime:_emscripten_exit_with_live_runtime,emscripten_get_callstack:_emscripten_get_callstack,emscripten_get_heap_max:_emscripten_get_heap_max,emscripten_get_now:_emscripten_get_now,emscripten_has_asyncify:_emscripten_has_asyncify,emscripten_num_logical_cores:_emscripten_num_logical_cores,emscripten_resize_heap:_emscripten_resize_heap,emwgpuAdapterRequestDevice:_emwgpuAdapterRequestDevice,emwgpuBufferDestroy:_emwgpuBufferDestroy,emwgpuBufferGetConstMappedRange:_emwgpuBufferGetConstMappedRange,emwgpuBufferMapAsync:_emwgpuBufferMapAsync,emwgpuBufferUnmap:_emwgpuBufferUnmap,emwgpuDelete:_emwgpuDelete,emwgpuDeviceCreateBuffer:_emwgpuDeviceCreateBuffer,emwgpuDeviceCreateShaderModule:_emwgpuDeviceCreateShaderModule,emwgpuDeviceDestroy:_emwgpuDeviceDestroy,emwgpuInstanceRequestAdapter:_emwgpuInstanceRequestAdapter,emwgpuQueueOnSubmittedWorkDone:_emwgpuQueueOnSubmittedWorkDone,emwgpuWaitAny:_emwgpuWaitAny,environ_get:_environ_get,environ_sizes_get:_environ_sizes_get,exit:_exit,fd_close:_fd_close,fd_read:_fd_read,fd_seek:_fd_seek,fd_write:_fd_write,memory:wasmMemory,random_get:_random_get,wgpuAdapterGetInfo:_wgpuAdapterGetInfo,wgpuAdapterGetLimits:_wgpuAdapterGetLimits,wgpuAdapterHasFeature:_wgpuAdapterHasFeature,wgpuBufferGetSize:_wgpuBufferGetSize,wgpuCommandEncoderBeginComputePass:_wgpuCommandEncoderBeginComputePass,wgpuCommandEncoderCopyBufferToBuffer:_wgpuCommandEncoderCopyBufferToBuffer,wgpuCommandEncoderFinish:_wgpuCommandEncoderFinish,wgpuComputePassEncoderDispatchWorkgroups:_wgpuComputePassEncoderDispatchWorkgroups,wgpuComputePassEncoderEnd:_wgpuComputePassEncoderEnd,wgpuComputePassEncoderSetBindGroup:_wgpuComputePassEncoderSetBindGroup,wgpuComputePassEncoderSetPipeline:_wgpuComputePassEncoderSetPipeline,wgpuComputePipelineGetBindGroupLayout:_wgpuComputePipelineGetBindGroupLayout,wgpuDeviceCreateBindGroup:_wgpuDeviceCreateBindGroup,wgpuDeviceCreateCommandEncoder:_wgpuDeviceCreateCommandEncoder,wgpuDeviceCreateComputePipeline:_wgpuDeviceCreateComputePipeline,wgpuInstanceHasWGSLLanguageFeature:_wgpuInstanceHasWGSLLanguageFeature,wgpuQueueSubmit:_wgpuQueueSubmit,wgpuQueueWriteBuffer:_wgpuQueueWriteBuffer}}function applySignatureConversions(wasmExports){wasmExports=Object.assign({},wasmExports);var makeWrapper_pp=f=>a0=>Number(f(BigInt(a0)));var makeWrapper__p=f=>a0=>f(BigInt(a0));var makeWrapper___PP=f=>(a0,a1,a2)=>f(a0,BigInt(a1?a1:0),BigInt(a2?a2:0));var makeWrapper_p=f=>()=>Number(f());var makeWrapper_ppp=f=>(a0,a1)=>Number(f(BigInt(a0),BigInt(a1)));var makeWrapper__p_____=f=>(a0,a1,a2,a3,a4,a5)=>f(BigInt(a0),a1,a2,a3,a4,a5);var makeWrapper___p_p_=f=>(a0,a1,a2,a3,a4)=>f(a0,BigInt(a1),a2,BigInt(a3),a4);var makeWrapper__pp=f=>(a0,a1)=>f(BigInt(a0),BigInt(a1));wasmExports["malloc"]=makeWrapper_pp(wasmExports["malloc"]);wasmExports["free"]=makeWrapper__p(wasmExports["free"]);wasmExports["main"]=makeWrapper___PP(wasmExports["main"]);wasmExports["pthread_self"]=makeWrapper_p(wasmExports["pthread_self"]);wasmExports["emscripten_builtin_memalign"]=makeWrapper_ppp(wasmExports["emscripten_builtin_memalign"]);wasmExports["_emscripten_thread_init"]=makeWrapper__p_____(wasmExports["_emscripten_thread_init"]);wasmExports["_emscripten_run_js_on_main_thread"]=makeWrapper___p_p_(wasmExports["_emscripten_run_js_on_main_thread"]);wasmExports["_emscripten_thread_free_data"]=makeWrapper__p(wasmExports["_emscripten_thread_free_data"]);wasmExports["_emscripten_thread_exit"]=makeWrapper__p(wasmExports["_emscripten_thread_exit"]);wasmExports["memalign"]=makeWrapper_ppp(wasmExports["memalign"]);wasmExports["emscripten_stack_set_limits"]=makeWrapper__pp(wasmExports["emscripten_stack_set_limits"]);wasmExports["_emscripten_stack_restore"]=makeWrapper__p(wasmExports["_emscripten_stack_restore"]);wasmExports["_emscripten_stack_alloc"]=makeWrapper_pp(wasmExports["_emscripten_stack_alloc"]);wasmExports["emscripten_stack_get_current"]=makeWrapper_p(wasmExports["emscripten_stack_get_current"]);return wasmExports}async function callMain(){var entryFunction=_main;var argc=0;var argv=0;try{var ret=entryFunction(argc,BigInt(argv));ret=await ret;exitJS(ret,true);return ret}catch(e){return handleException(e)}}function run(){if(runDependencies>0){dependenciesFulfilled=run;return}if(ENVIRONMENT_IS_PTHREAD){initRuntime();return}preRun();if(runDependencies>0){dependenciesFulfilled=run;return}async function doRun(){Module["calledRun"]=true;if(ABORT)return;initRuntime();preMain();Module["onRuntimeInitialized"]?.();var noInitialRun=Module["noInitialRun"]||false;if(!noInitialRun)await callMain();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(()=>{setTimeout(()=>Module["setStatus"](""),1);doRun()},1)}else{doRun()}}var wasmExports;if(!ENVIRONMENT_IS_PTHREAD){createWasm();run()}\n';

// src/worker.ts
var FILE_READ_REQ_EVENT = "fs.read_req";
var JSPI_STUB = `
if (!WebAssembly.Suspending) {
  // JSPI not available - stubs that keep the import/export tables valid.
  // Suspending wraps imports: identity is fine since async imports won't be called.
  WebAssembly.Suspending = function (fn) {
    // console.log(fn.toString());
    return fn;
  };
  // promising wraps exports: must return a Promise so ccall's ret.then() works.
  WebAssembly.promising = function (fn) {
    return function (...args) {
      try {
        return Promise.resolve(fn(...args));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  };
}
`;
var ProxyToWorker = class {
  // filename -> Blob for async reads
  constructor(resources, nbThread, suppressNativeLog, logger) {
    __publicField(this, "resources");
    __publicField(this, "logger");
    __publicField(this, "suppressNativeLog");
    __publicField(this, "taskQueue", []);
    __publicField(this, "taskId", 1);
    __publicField(this, "resultQueue", []);
    __publicField(this, "busy", false);
    // is the work loop is running?
    __publicField(this, "worker");
    __publicField(this, "multiThread");
    __publicField(this, "nbThread");
    __publicField(this, "useAsyncFile");
    __publicField(this, "fileBlobs", /* @__PURE__ */ new Map());
    this.resources = resources;
    this.nbThread = nbThread;
    this.multiThread = nbThread > 0;
    this.logger = logger;
    this.suppressNativeLog = suppressNativeLog;
    this.useAsyncFile = canUseAsyncFileRead(resources.compat);
  }
  getModuleCode() {
    return __async(this, null, function* () {
      if (!this.resources.jsPath) {
        if (this.resources.compat) {
          throw new Error(
            "compat mode is enabled but no jsPath was provided. Pass a worker JS via setCompat() or install @wllama/wllama-compat."
          );
        }
        return WLLAMA_EMSCRIPTEN_CODE;
      } else if (this.resources.jsPath.code) {
        return this.resources.jsPath.code;
      } else if (isString(this.resources.jsPath)) {
        const response = yield fetch(this.resources.jsPath);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch worker code from ${this.resources.jsPath}`
          );
        }
        return yield response.text();
      } else {
        throw new Error("No JS code provided for worker");
      }
    });
  }
  moduleInit(ggufFiles) {
    return __async(this, null, function* () {
      let moduleCode = JSPI_STUB + (yield this.getModuleCode());
      let mainModuleCode = moduleCode.replace("var Module", "var ___Module");
      const runOptions = {
        pathConfig: {
          "wllama.wasm": this.resources.wasmPath
        },
        nbThread: this.nbThread,
        compat: this.resources.compat
      };
      const completeCode = [
        `const RUN_OPTIONS = ${JSON.stringify(runOptions)};`,
        `function wModuleInit() { ${mainModuleCode}; return Module; }`,
        LLAMA_CPP_WORKER_CODE
      ].join(";\n\n");
      this.worker = createWorker(completeCode);
      this.worker.onmessage = this.onRecvMsg.bind(this);
      this.worker.onerror = this.logger.error;
      const res = yield this.pushTask({
        verb: "module.init",
        args: [
          new Blob([moduleCode], { type: "text/javascript" }),
          this.useAsyncFile
        ],
        callbackId: this.taskId++
      });
      const nativeFiles = [];
      for (const file of ggufFiles) {
        const needAllocBuffer = !this.useAsyncFile;
        const id = yield this.fileAlloc(
          file.name,
          file.blob.size,
          needAllocBuffer
        );
        nativeFiles.push(__spreadValues({ id }, file));
        if (this.useAsyncFile) {
          this.fileBlobs.set(file.name, file.blob);
        }
      }
      if (!this.useAsyncFile) {
        yield Promise.all(
          nativeFiles.map((file) => {
            return this.fileWrite(file.id, file.blob);
          })
        );
      }
      return res;
    });
  }
  wllamaStart() {
    return __async(this, null, function* () {
      const result = yield this.pushTask({
        verb: "wllama.start",
        args: [],
        callbackId: this.taskId++
      });
      const parsedResult = this.parseResult(result);
      return parsedResult;
    });
  }
  wllamaAction(name, body) {
    return __async(this, null, function* () {
      const encodedMsg = glueSerialize(body);
      const result = yield this.pushTask({
        verb: "wllama.action",
        args: [name, encodedMsg],
        callbackId: this.taskId++
      });
      const parsedResult = glueDeserialize(result);
      return parsedResult;
    });
  }
  wllamaExit() {
    return __async(this, null, function* () {
      if (this.worker) {
        this.worker.terminate();
      }
    });
  }
  wllamaDebug() {
    return __async(this, null, function* () {
      const result = yield this.pushTask({
        verb: "wllama.debug",
        args: [],
        callbackId: this.taskId++
      });
      return JSON.parse(result);
    });
  }
  ///////////////////////////////////////
  /**
   * Allocate a new file in heapfs
   * @returns fileId, to be used by fileWrite()
   */
  fileAlloc(fileName, size, allocBuffer) {
    return __async(this, null, function* () {
      const result = yield this.pushTask({
        verb: "fs.alloc",
        args: [fileName, size, allocBuffer],
        callbackId: this.taskId++
      });
      return result.fileId;
    });
  }
  /**
   * Write a Blob to heapfs
   */
  fileWrite(fileId, blob) {
    return __async(this, null, function* () {
      const reader = blob.stream().getReader();
      let offset = 0;
      while (true) {
        const { done, value } = yield reader.read();
        if (done) break;
        const size = value.byteLength;
        yield this.pushTask(
          {
            verb: "fs.write",
            args: [fileId, value, offset],
            callbackId: this.taskId++
          },
          // @ts-ignore Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer'
          [value.buffer]
        );
        offset += size;
      }
    });
  }
  fileReadResponse(name, offset, size) {
    return __async(this, null, function* () {
      var _a;
      try {
        const blob = this.fileBlobs.get(name);
        if (!blob) {
          throw new Error(`blob not found for name="${name}"`);
        }
        const chunk = blob.slice(offset, offset + size);
        const buffer = yield chunk.arrayBuffer();
        this.worker.postMessage(
          { verb: "fs.read_res", args: [buffer] },
          { transfer: [buffer] }
        );
      } catch (err) {
        this.logger.error("fileReadResponse failed, terminating worker:", err);
        (_a = this.worker) == null ? void 0 : _a.terminate();
        this.worker = void 0;
        this.abort(`File read failed: ${err}`, err.stack || "");
      }
    });
  }
  /**
   * Parse JSON result returned by cpp code.
   * Throw new Error if "__exception" is present in the response
   *
   * TODO: get rid of this function once everything is migrated to Glue
   */
  parseResult(result) {
    const parsedResult = JSON.parse(result);
    if (parsedResult && parsedResult["error"]) {
      throw new WllamaRuntimeError("Unknown error, please see console.log", "");
    }
    return parsedResult;
  }
  /**
   * Push a new task to taskQueue
   */
  pushTask(param, buffers) {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ resolve, reject, param, buffers });
      this.runTaskLoop();
    });
  }
  /**
   * Main loop for processing tasks
   */
  runTaskLoop() {
    return __async(this, null, function* () {
      var _a;
      if (this.busy) {
        return;
      }
      this.busy = true;
      while (true) {
        const task = this.taskQueue.shift();
        if (!task) break;
        this.resultQueue.push(task);
        this.worker.postMessage(
          task.param,
          isSafariMobile() ? void 0 : {
            transfer: (_a = task.buffers) != null ? _a : []
          }
        );
      }
      this.busy = false;
    });
  }
  /**
   * Handle messages from worker
   */
  onRecvMsg(e) {
    if (!e.data) return;
    const { verb, args } = e.data;
    const isCompatBuild = this.resources.compat;
    if (verb && verb.startsWith("console.")) {
      if (this.suppressNativeLog) {
        return;
      }
      if (verb.endsWith("debug")) this.logger.debug(...args);
      if (verb.endsWith("log")) this.logger.log(...args);
      if (verb.endsWith("warn")) this.logger.warn(...args);
      if (verb.endsWith("error")) this.logger.error(...args);
      return;
    } else if (verb === "signal.abort") {
      const [signalType, message, rawStack, originalErr] = args;
      if (originalErr) {
        this.logger.error(originalErr);
      }
      (() => __async(this, null, function* () {
        let stack = "";
        let newMsg = message.replace(
          "Build with -sASSERTIONS for more info.",
          ""
        );
        if (signalType === "abort") {
          newMsg = `(ABORT) ${newMsg}`;
          stack = rawStack.replace(/\|/g, "\n");
        } else if (signalType === "exception") {
          stack = rawStack;
        }
        const decoded = yield Debug.decodeStackTrace(stack, isCompatBuild);
        this.logger.error(`Stack trace (${signalType}):
` + decoded);
        this.abort(newMsg, decoded);
      }))();
      return;
    }
    if (verb === FILE_READ_REQ_EVENT) {
      const [name, offset, size] = args;
      this.fileReadResponse(name, offset, size).catch(() => {
      });
      return;
    }
    const { callbackId, result, err } = e.data;
    if (callbackId) {
      const idx = this.resultQueue.findIndex(
        (t) => t.param.callbackId === callbackId
      );
      if (idx !== -1) {
        const waitingTask = this.resultQueue.splice(idx, 1)[0];
        if (err) waitingTask.reject(err);
        else waitingTask.resolve(result);
      } else {
        this.logger.error(
          `Cannot find waiting task with callbackId = ${callbackId}`
        );
      }
    }
  }
  abort(text, stack) {
    const error = new WllamaRuntimeError(
      text.length == 0 ? "(unknown error)" : text,
      stack
    );
    while (this.resultQueue.length > 0) {
      const waitingTask = this.resultQueue.pop();
      if (!waitingTask) break;
      waitingTask.reject(error);
    }
    while (this.taskQueue.length > 0) {
      const pendingTask = this.taskQueue.pop();
      if (!pendingTask) break;
      pendingTask.reject(error);
    }
  }
};

// src/storage/opfs.ts
var OPFSBackend = class {
  read(key) {
    return __async(this, null, function* () {
      try {
        const cacheDir = yield getCacheDir();
        const fileHandle = yield cacheDir.getFileHandle(key);
        return yield fileHandle.getFile();
      } catch (e) {
        return null;
      }
    });
  }
  write(key, stream) {
    return __async(this, null, function* () {
      const writable = yield openWritable(key);
      yield writable.truncate(0);
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = yield reader.read();
          if (done) break;
          yield writable.write(value);
        }
      } finally {
        yield writable.close();
      }
    });
  }
  getSize(key) {
    return __async(this, null, function* () {
      try {
        const cacheDir = yield getCacheDir();
        const fileHandle = yield cacheDir.getFileHandle(key);
        const file = yield fileHandle.getFile();
        return file.size;
      } catch (e) {
        return -1;
      }
    });
  }
  list() {
    return __async(this, null, function* () {
      const cacheDir = yield getCacheDir();
      const result = [];
      try {
        for (var iter = __forAwait(cacheDir.entries()), more, temp, error; more = !(temp = yield iter.next()).done; more = false) {
          const [name, handle] = temp.value;
          if (handle.kind === "file") {
            const file = yield handle.getFile();
            result.push({ key: name, size: file.size });
          }
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && (yield temp.call(iter));
        } finally {
          if (error)
            throw error[0];
        }
      }
      return result;
    });
  }
  delete(key) {
    return __async(this, null, function* () {
      try {
        const cacheDir = yield getCacheDir();
        yield cacheDir.removeEntry(key);
      } catch (e) {
        if ((e == null ? void 0 : e.name) !== "NotFoundError") throw e;
      }
    });
  }
};
function getCacheDir() {
  return __async(this, null, function* () {
    const opfsRoot = yield navigator.storage.getDirectory();
    return opfsRoot.getDirectoryHandle("cache", { create: true });
  });
}
function openWritable(fileName) {
  return __async(this, null, function* () {
    const worker = createWorker(OPFS_UTILS_WORKER_CODE);
    let pResolve;
    let pReject;
    worker.onmessage = (e) => {
      if (e.data.ok) pResolve(null);
      else if (e.data.err) pReject(e.data.err);
    };
    worker.onerror = (e) => {
      var _a;
      return pReject == null ? void 0 : pReject((_a = e.message) != null ? _a : e);
    };
    const workerExec = (data) => new Promise((resolve, reject) => {
      pResolve = resolve;
      pReject = reject;
      worker.postMessage(
        data,
        isSafariMobile() ? void 0 : { transfer: "buf" in data && data.buf ? [data.buf.buffer] : [] }
      );
    });
    yield workerExec({ action: "open", filename: fileName });
    return {
      truncate: () => __async(this, null, function* () {
      }),
      write: (value) => workerExec({ action: "write", buf: value }),
      close: () => __async(this, null, function* () {
        yield workerExec({ action: "close" });
        worker.terminate();
      })
    };
  });
}

// src/cache-manager.ts
var PREFIX_METADATA = "__metadata__";
var POLYFILL_ETAG = "polyfill_for_older_version";
var CacheManager = class {
  constructor(backend = new OPFSBackend()) {
    __publicField(this, "sb");
    this.sb = backend;
  }
  /**
   * Convert a given URL into a storage key.
   *
   * Format: `${hashSHA1(fullURL)}_${fileName}`
   */
  getNameFromURL(url) {
    return __async(this, null, function* () {
      return urlToFileName(url, "");
    });
  }
  /**
   * @deprecated Use `download()` instead
   *
   * Write a new file to cache. This will overwrite existing file.
   *
   * @param name The file name returned by `getNameFromURL()` or `list()`
   */
  write(name, stream, metadata) {
    return __async(this, null, function* () {
      yield this.sb.write(name, stream);
      yield this.writeMetadata(name, metadata);
    });
  }
  download(_0) {
    return __async(this, arguments, function* (url, options = {}) {
      var _a;
      const fileKey = yield urlToFileName(url, "");
      const response = yield fetch(url, __spreadValues(__spreadValues({}, options.headers ? { headers: options.headers } : {}), options.signal ? { signal: options.signal } : {}));
      if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
      }
      const contentLength = response.headers.get("content-length");
      const etag = (response.headers.get("etag") || "").replace(
        /[^A-Za-z0-9]/g,
        ""
      );
      const total = parseInt(contentLength != null ? contentLength : "0", 10);
      const progressCallback = options.progressCallback;
      let loaded = 0;
      let lastProgressAt = 0;
      const progressStream = new TransformStream({
        transform(chunk, controller) {
          loaded += chunk.byteLength;
          if (progressCallback) {
            const now = Date.now();
            if (now - lastProgressAt > 100) {
              lastProgressAt = now;
              progressCallback({ loaded, total });
            }
          }
          controller.enqueue(chunk);
        },
        flush() {
          progressCallback == null ? void 0 : progressCallback({ loaded, total: total || loaded });
        }
      });
      yield this.sb.write(fileKey, response.body.pipeThrough(progressStream));
      yield this.writeMetadata(fileKey, __spreadValues({
        originalURL: url,
        originalSize: total,
        etag
      }, (_a = options.metadataAdditional) != null ? _a : {}));
    });
  }
  /**
   * Open a file in cache for reading
   *
   * @param nameOrURL The file name returned by `getNameFromURL()` or `list()`, or the original URL of the remote file
   * @returns Blob, or null if file does not exist
   */
  open(nameOrURL) {
    return __async(this, null, function* () {
      const direct = yield this.sb.read(nameOrURL);
      if (direct) return direct;
      const key = yield urlToFileName(nameOrURL, "");
      return this.sb.read(key);
    });
  }
  /**
   * Get the size of a file in stored cache
   *
   * NOTE: in case the download is stopped mid-way (i.e. user close browser tab), the file maybe corrupted, size maybe different from `metadata.originalSize`
   *
   * @param name The file name returned by `getNameFromURL()` or `list()`
   * @returns number of bytes, or -1 if file does not exist
   */
  getSize(name) {
    return __async(this, null, function* () {
      return this.sb.getSize(name);
    });
  }
  /**
   * Get metadata of a cached file
   */
  getMetadata(name) {
    return __async(this, null, function* () {
      const blob = yield this.sb.read(`${PREFIX_METADATA}${name}`);
      const cachedSize = yield this.sb.getSize(name);
      if (!blob) {
        return cachedSize > 0 ? (
          // files created by older version of wllama don't have metadata; polyfill it
          {
            etag: POLYFILL_ETAG,
            originalSize: cachedSize,
            originalURL: ""
          }
        ) : (
          // cached file not found
          null
        );
      }
      try {
        return yield new Response(blob).json();
      } catch (e) {
        return null;
      }
    });
  }
  /**
   * List all files currently in cache
   */
  list() {
    return __async(this, null, function* () {
      const all = yield this.sb.list();
      const metadataMap = {};
      for (const { key } of all) {
        if (key.startsWith(PREFIX_METADATA)) {
          const blob = yield this.sb.read(key);
          if (blob) {
            const meta = yield new Response(blob).json().catch(() => null);
            metadataMap[key.slice(PREFIX_METADATA.length)] = meta;
          }
        }
      }
      const result = [];
      for (const { key, size } of all) {
        if (!key.startsWith(PREFIX_METADATA)) {
          result.push({
            name: key,
            size,
            metadata: metadataMap[key] || {
              originalSize: size,
              originalURL: "",
              etag: ""
            }
          });
        }
      }
      return result;
    });
  }
  /**
   * Clear all files currently in cache
   */
  clear() {
    return __async(this, null, function* () {
      yield this.deleteMany(() => true);
    });
  }
  /**
   * Delete a single file in cache
   *
   * @param nameOrURL Can be either an URL or a name returned by `getNameFromURL()` or `list()`
   */
  delete(nameOrURL) {
    return __async(this, null, function* () {
      const name2 = yield this.getNameFromURL(nameOrURL);
      yield this.deleteMany(
        (entry) => entry.name === nameOrURL || entry.name === name2
      );
    });
  }
  /**
   * Delete multiple files in cache.
   *
   * @param predicate A predicate like `array.filter(item => boolean)`
   */
  deleteMany(predicate) {
    return __async(this, null, function* () {
      const list = yield this.list();
      for (const item of list) {
        if (predicate(item)) {
          yield this.sb.delete(item.name);
          yield this.sb.delete(`${PREFIX_METADATA}${item.name}`);
        }
      }
    });
  }
  /**
   * Write the metadata of the file to disk.
   */
  writeMetadata(name, metadata) {
    return __async(this, null, function* () {
      const blob = new Blob([JSON.stringify(metadata)], { type: "text/plain" });
      yield this.sb.write(`${PREFIX_METADATA}${name}`, blob.stream());
    });
  }
};
var cache_manager_default = CacheManager;
function urlToFileName(url, prefix) {
  return __async(this, null, function* () {
    const hashBuffer = yield crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(url)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${prefix}${hashHex}_${url.split("/").pop()}`;
  });
}

// src/model-manager.ts
var DEFAULT_PARALLEL_DOWNLOADS = 3;
var ModelValidationStatus = /* @__PURE__ */ ((ModelValidationStatus2) => {
  ModelValidationStatus2["VALID"] = "valid";
  ModelValidationStatus2["INVALID"] = "invalid";
  ModelValidationStatus2["DELETED"] = "deleted";
  return ModelValidationStatus2;
})(ModelValidationStatus || {});
var Model = class {
  constructor(modelManager, url, mmprojUrl, savedFiles) {
    __publicField(this, "modelManager");
    /**
     * URL to the GGUF file (in case it contains multiple shards, the URL should point to the first shard)
     *
     * This URL will be used to identify the model in the cache. There can't be 2 models with the same URL.
     */
    __publicField(this, "url");
    /**
     * URL to mmproj file, if exists
     */
    __publicField(this, "mmprojUrl");
    /**
     * Size in bytes (total size of all shards).
     *
     * A value of -1 means the model is deleted from the cache. You must call `ModelManager.downloadModel` to re-download the model.
     */
    __publicField(this, "size");
    /**
     * List of all shards in the cache, sorted by original URL (ascending order)
     */
    __publicField(this, "files");
    this.modelManager = modelManager;
    this.url = url;
    this.mmprojUrl = mmprojUrl;
    if (savedFiles) {
      this.files = this.getAllFiles(savedFiles);
      this.size = sumArr(this.files.map((f) => f.metadata.originalSize));
    } else {
      this.files = [];
      this.size = 0;
    }
  }
  /**
   * Open and get a list of all shards as Blobs
   */
  open() {
    return __async(this, null, function* () {
      if (this.size === -1) {
        throw new WllamaError(
          `Model is deleted from the cache; Call ModelManager.downloadModel to re-download the model`,
          "load_error"
        );
      }
      const blobs = [];
      for (const file of this.files) {
        const blob = yield this.modelManager.cacheManager.open(file.name);
        if (!blob) {
          throw new Error(
            `Failed to open file ${file.name}; Hint: the model may be invalid, please refresh it`
          );
        }
        blobs.push(blob);
      }
      return blobs;
    });
  }
  /**
   * Validate the model files.
   *
   * If the model is invalid, the model manager will not be able to use it. You must call `refresh` to re-download the model.
   *
   * Cases that model is invalid:
   * - The model is deleted from the cache
   * - The model files are missing (or the download is interrupted)
   */
  validate() {
    let nbShards = ModelManager.parseModelUrl(this.url).length;
    if (this.mmprojUrl) {
      nbShards += 1;
    }
    if (this.size === -1) {
      return "deleted" /* DELETED */;
    }
    if (this.size < 16 || this.files.length !== nbShards) {
      return "invalid" /* INVALID */;
    }
    for (const file of this.files) {
      if (!file.metadata || file.metadata.originalSize !== file.size) {
        return "invalid" /* INVALID */;
      }
    }
    return "valid" /* VALID */;
  }
  /**
   * In case the model is invalid, call this function to re-download the model
   */
  refresh() {
    return __async(this, arguments, function* (options = {}) {
      var _a;
      const urls = ModelManager.parseModelUrl(this.url);
      if (this.mmprojUrl) {
        urls.push(this.mmprojUrl);
      }
      const works = urls.map((url, index) => ({
        url,
        index
      }));
      this.modelManager.logger.debug("Downloading model files:", urls);
      const nParallel = (_a = this.modelManager.params.parallelDownloads) != null ? _a : DEFAULT_PARALLEL_DOWNLOADS;
      const totalSize = yield this.getTotalDownloadSize(urls);
      const loadedSize = [];
      const worker = () => __async(this, null, function* () {
        while (works.length > 0) {
          const w = works.shift();
          if (!w) break;
          yield this.modelManager.cacheManager.download(w.url, __spreadProps(__spreadValues({}, options), {
            metadataAdditional: {
              originalURL: w.url,
              mmprojURL: this.mmprojUrl
            },
            progressCallback: ({ loaded }) => {
              var _a2;
              loadedSize[w.index] = loaded;
              (_a2 = options.progressCallback) == null ? void 0 : _a2.call(options, {
                loaded: sumArr(loadedSize),
                total: totalSize
              });
            }
          }));
        }
      });
      const promises = [];
      for (let i = 0; i < nParallel; i++) {
        promises.push(worker());
        loadedSize.push(0);
      }
      yield Promise.all(promises);
      this.files = this.getAllFiles(yield this.modelManager.cacheManager.list());
      this.size = this.files.reduce((acc, f) => acc + f.metadata.originalSize, 0);
    });
  }
  /**
   * Remove the model from the cache
   */
  remove() {
    return __async(this, null, function* () {
      this.files = this.getAllFiles(yield this.modelManager.cacheManager.list());
      yield this.modelManager.cacheManager.deleteMany(
        (f) => !!this.files.find((file) => file.name === f.name)
      );
      this.size = -1;
    });
  }
  getAllFiles(savedFiles) {
    const allUrls = new Set(ModelManager.parseModelUrl(this.url));
    if (this.mmprojUrl) {
      allUrls.add(this.mmprojUrl);
    }
    const allFiles = [];
    for (const url of allUrls) {
      const file = savedFiles.find((f) => f.metadata.originalURL === url);
      if (!file) {
        throw new Error(`Model file not found: ${url}`);
      }
      allFiles.push(file);
    }
    allFiles.sort(
      (a, b) => a.metadata.originalURL.localeCompare(b.metadata.originalURL)
    );
    return allFiles;
  }
  getTotalDownloadSize(urls) {
    return __async(this, null, function* () {
      const responses = yield Promise.all(
        urls.map((url) => fetch(url, { method: "HEAD" }))
      );
      const sizes = responses.map(
        (res) => Number(res.headers.get("content-length") || "0")
      );
      return sumArr(sizes);
    });
  }
};
var ModelManager = class _ModelManager {
  constructor(params = {}) {
    // The CacheManager singleton, can be accessed by user
    __publicField(this, "cacheManager");
    __publicField(this, "params");
    __publicField(this, "logger");
    this.cacheManager = params.cacheManager || new cache_manager_default();
    this.params = params;
    this.logger = params.logger || console;
  }
  /**
   * Parses a model URL and returns an array of URLs based on the following patterns:
   * - If the input URL is an array, it returns the array itself.
   * - If the input URL is a string in the `gguf-split` format, it returns an array containing the URL of each shard in ascending order.
   * - Otherwise, it returns an array containing the input URL as a single element array.
   * @param modelUrl URL or list of URLs
   */
  static parseModelUrl(modelUrl) {
    var _a;
    if (Array.isArray(modelUrl)) {
      return modelUrl;
    }
    const urlPartsRegex = /-(\d{5})-of-(\d{5})\.gguf(?:\?.*)?$/;
    const queryMatch = modelUrl.match(/\.gguf(\?.*)?$/);
    const queryParams = (_a = queryMatch == null ? void 0 : queryMatch[1]) != null ? _a : "";
    const matches = modelUrl.match(urlPartsRegex);
    if (!matches) {
      return [modelUrl];
    }
    const baseURL = modelUrl.replace(urlPartsRegex, "");
    const total = matches[2];
    const paddedShardIds = Array.from(
      { length: Number(total) },
      (_, index) => (index + 1).toString().padStart(5, "0")
    );
    return paddedShardIds.map(
      (current) => `${baseURL}-${current}-of-${total}.gguf${queryParams}`
    );
  }
  /**
   * Get all models in the cache
   */
  getModels() {
    return __async(this, arguments, function* (opts = {}) {
      const cachedFiles = yield this.cacheManager.list();
      let models = [];
      for (const file of cachedFiles) {
        const shards = _ModelManager.parseModelUrl(file.metadata.originalURL);
        const mmprojUrl = file.metadata.mmprojURL;
        const isFirstShard = shards.length === 1 || shards[0] === file.metadata.originalURL;
        if (isFirstShard) {
          models.push(
            new Model(this, file.metadata.originalURL, mmprojUrl, cachedFiles)
          );
        }
      }
      if (!opts.includeInvalid) {
        models = models.filter(
          (m) => m.validate() === "valid" /* VALID */
        );
      }
      return models;
    });
  }
  /**
   * Download a model from the given URL.
   *
   * The URL must end with `.gguf`
   */
  downloadModel(_0) {
    return __async(this, arguments, function* (sourceOrURL, options = {}) {
      const source = isString(sourceOrURL) ? { url: sourceOrURL } : sourceOrURL;
      if (!isValidGgufFile(source.url)) {
        throw new WllamaError(
          `Invalid model URL: ${source.url}; URL must ends with ".gguf"`,
          "download_error"
        );
      }
      const model = new Model(this, source.url, source.mmprojUrl);
      const validity = model.validate();
      if (validity !== "valid" /* VALID */) {
        yield model.refresh(options);
      }
      return model;
    });
  }
  /**
   * Get a model from the cache or download it if it's not available.
   */
  getModelOrDownload(_0) {
    return __async(this, arguments, function* (source, options = {}) {
      var _a;
      const models = yield this.getModels();
      const model = models.find((m) => m.url === source.url);
      if (model) {
        (_a = options.progressCallback) == null ? void 0 : _a.call(options, { loaded: model.size, total: model.size });
        return model;
      }
      return this.downloadModel(source, options);
    });
  }
  /**
   * Remove all models from the cache
   */
  clear() {
    return __async(this, null, function* () {
      yield this.cacheManager.clear();
    });
  }
};

// src/types/types.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 1] = "DEBUG";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  return LogLevel2;
})(LogLevel || {});

// src/huggingface.ts
var HF_BASE = "https://huggingface.co";
var DEFAULT_QUANTS = ["Q4_K_M", "Q8_0"];
function fetchRepoFiles(repo, token) {
  return __async(this, null, function* () {
    var _a;
    const url = `${HF_BASE}/api/models/${repo}/tree/main?recursive=true`;
    const headers = { Accept: "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = yield fetch(url, { headers });
    if (!res.ok) {
      let msg = res.statusText;
      try {
        msg = (_a = (yield res.json()).error) != null ? _a : msg;
      } catch (e) {
      }
      throw new Error(`HF API error (${res.status}): ${msg}`);
    }
    return res.json();
  });
}
function firstShardPath(files, path) {
  const m = path.match(/^(.+)-(\d{5})-of-(\d{5})\.gguf$/i);
  if (!m) return path;
  const first = `${m[1]}-00001-of-${m[3]}.gguf`;
  return files.some((f) => f.path === first) ? first : path;
}
function selectFile(files, quant, mmprojOnly) {
  const candidates = files.filter((f) => {
    if (f.type !== "file" || !f.path.toLowerCase().endsWith(".gguf"))
      return false;
    const ismmproj = f.path.toLowerCase().includes("mmproj");
    return mmprojOnly ? ismmproj : !ismmproj;
  });
  if (candidates.length === 0) return null;
  if (quant) {
    const upper = quant.toUpperCase();
    const match = candidates.find((f) => f.path.toUpperCase().includes(upper));
    if (match) return firstShardPath(candidates, match.path);
    return null;
  }
  for (const q of DEFAULT_QUANTS) {
    const match = candidates.find((f) => f.path.toUpperCase().includes(q));
    if (match) return firstShardPath(candidates, match.path);
  }
  return firstShardPath(candidates, candidates[0].path);
}
function getHFModelSource(config) {
  return __async(this, null, function* () {
    const { repo, file, quant, mmprojFile, mmprojQuant, hfToken } = config;
    const files = yield fetchRepoFiles(repo, hfToken);
    const modelPath = file != null ? file : selectFile(files, quant, false);
    if (!modelPath) {
      throw new Error(`No GGUF file found in repo "${repo}"`);
    }
    const source = {
      url: `${HF_BASE}/${repo}/resolve/main/${modelPath}`
    };
    if (mmprojFile || mmprojQuant !== void 0) {
      const mmpath = mmprojFile != null ? mmprojFile : selectFile(files, mmprojQuant, true);
      if (mmpath) {
        source.mmprojUrl = `${HF_BASE}/${repo}/resolve/main/${mmpath}`;
      }
    }
    if (hfToken) {
      const params = new URLSearchParams({ token: hfToken });
      source.url += `?${params}`;
      if (source.mmprojUrl) {
        source.mmprojUrl += `?${params}`;
      }
    }
    return source;
  });
}

// src/wasm-from-cdn.ts
var WasmCompatFromCDN = {
  worker: "https://cdn.jsdelivr.net/npm/@wllama/wllama-compat@3.4.1/wasm/wllama.js",
  wasm: "https://cdn.jsdelivr.net/npm/@wllama/wllama-compat@3.4.1/wasm/wllama.wasm"
};

// src/wllama.ts
var LoggerWithoutDebug = __spreadProps(__spreadValues({}, console), {
  debug: () => {
  }
});
var WllamaError = class extends Error {
  constructor(message, type = "unknown_error") {
    super(message);
    __publicField(this, "type");
    this.type = type;
  }
};
var WllamaAbortError = class extends Error {
  constructor() {
    super("Operation aborted");
    __publicField(this, "name", "AbortError");
  }
};
var WllamaRuntimeError = class extends Error {
  constructor(message, stack) {
    super(message);
    __publicField(this, "name", "RuntimeError");
    __publicField(this, "stack");
    this.stack = stack;
  }
};
var Wllama = class {
  constructor(pathConfig, wllamaConfig = {}) {
    // The CacheManager and ModelManager are singleton, can be accessed by user
    __publicField(this, "cacheManager");
    __publicField(this, "modelManager");
    __publicField(this, "compat", null);
    __publicField(this, "proxy", null);
    __publicField(this, "config");
    __publicField(this, "pathConfig");
    __publicField(this, "useMultiThread", false);
    __publicField(this, "nbThreads", 1);
    __publicField(this, "useEmbeddings", false);
    __publicField(this, "useRerank", false);
    // available when loaded
    __publicField(this, "loadedContextInfo", null);
    __publicField(this, "seed");
    __publicField(this, "bosToken", -1);
    __publicField(this, "eosToken", -1);
    __publicField(this, "eotToken", -1);
    __publicField(this, "eogTokens", /* @__PURE__ */ new Set());
    __publicField(this, "addBosToken", false);
    __publicField(this, "addEosToken", false);
    __publicField(this, "mediaMarker");
    __publicField(this, "chatTemplate");
    __publicField(this, "metadata");
    __publicField(this, "hasEncoder", false);
    __publicField(this, "decoderStartToken", -1);
    // note: we overlay instead of using llama-server default_template_kwargs, because we cannot transfer complex data structure via GLUE
    // overlay allow mixed data type or nested structure for kwargs
    __publicField(this, "chatTemplateKwargs", {});
    var _a, _b, _c;
    checkEnvironmentCompatible();
    if (!pathConfig) throw new WllamaError("AssetsPathConfig is required");
    this.pathConfig = pathConfig;
    this.config = wllamaConfig;
    this.cacheManager = (_a = wllamaConfig.cacheManager) != null ? _a : new cache_manager_default();
    this.modelManager = (_c = wllamaConfig.modelManager) != null ? _c : new ModelManager({
      cacheManager: this.cacheManager,
      logger: (_b = wllamaConfig.logger) != null ? _b : console,
      parallelDownloads: wllamaConfig.parallelDownloads,
      allowOffline: wllamaConfig.allowOffline
    });
    this.setCompat("default");
  }
  logger() {
    var _a;
    return (_a = this.config.logger) != null ? _a : console;
  }
  checkModelLoaded() {
    if (!this.isModelLoaded()) {
      throw new WllamaError(
        "loadModel() is not yet called",
        "model_not_loaded"
      );
    }
  }
  /**
   * Get the libllama version string, e.g. "b6327-4d74393".
   *
   * @returns version string embedded at build time.
   */
  static getLibllamaVersion() {
    return LIBLLAMA_VERSION;
  }
  /**
   * Set compatibility options for Wllama.
   * @param compat Set to null to disable compatibility, or 'default' to use the default compat resources from CDN.
   * @param mode 'safari' by default; If set to 'firefox_safari', the compat mode will **also** be enabled on Firefox, which will significantly degrade the performance but allow using WebGPU on Firefox.
   */
  setCompat(compat, mode = "safari") {
    if (mode === "safari") {
      if (isFirefox()) {
        this.compat = null;
        return;
      }
    }
    this.compat = compat === "default" ? WasmCompatFromCDN : compat;
  }
  /**
   * Check if the model is loaded via `loadModel()`
   */
  isModelLoaded() {
    return !!this.proxy && !!this.metadata;
  }
  /**
   * Get token ID associated to BOS (begin of sentence) token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getBOS() {
    return this.bosToken;
  }
  /**
   * Get token ID associated to EOS (end of sentence) token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getEOS() {
    return this.eosToken;
  }
  /**
   * Get token ID associated to EOT (end of turn) token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getEOT() {
    return this.eotToken;
  }
  /**
   * Check if a given token is end-of-generation token (e.g. EOS, EOT, etc.)
   *
   * @param token the token ID to be checked
   * @returns true if the token is EOS, EOT, or any other end-of-generation tokens
   */
  isTokenEOG(token) {
    return token === this.eosToken || token === this.eotToken || this.eogTokens.has(token);
  }
  /**
   * Get token ID associated to token used by decoder, to start generating output sequence(only usable for encoder-decoder architecture). In other words, encoder uses normal BOS and decoder uses this token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getDecoderStartToken() {
    return this.decoderStartToken;
  }
  /**
   * Get model hyper-parameters and metadata
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns ModelMetadata
   */
  getModelMetadata() {
    this.checkModelLoaded();
    return this.metadata;
  }
  /**
   * Check if we're currently using multi-thread build.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if multi-thread is used.
   */
  isMultithread() {
    this.checkModelLoaded();
    return this.useMultiThread;
  }
  /**
   * Get number of threads used in the current context.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns number of threads
   */
  getNumThreads() {
    this.checkModelLoaded();
    return this.useMultiThread ? this.nbThreads : 1;
  }
  /**
   * Check if the current model uses encoder-decoder architecture
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if multi-thread is used.
   */
  isEncoderDecoderArchitecture() {
    this.checkModelLoaded();
    return this.hasEncoder;
  }
  /**
   * Must we add BOS token to the tokenized sequence?
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if BOS token must be added to the sequence
   */
  mustAddBosToken() {
    this.checkModelLoaded();
    return this.addBosToken;
  }
  /**
   * Must we add EOS token to the tokenized sequence?
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if EOS token must be added to the sequence
   */
  mustAddEosToken() {
    this.checkModelLoaded();
    return this.addEosToken;
  }
  /**
   * Get the jinja chat template comes with the model. It only available if the original model (before converting to gguf) has the template in `tokenizer_config.json`
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns the jinja template. null if there is no template in gguf
   */
  getChatTemplate() {
    var _a;
    this.checkModelLoaded();
    return (_a = this.chatTemplate) != null ? _a : null;
  }
  /**
   * Check if WebGPU is supported by the current environment.
   * @returns true if WebGPU is supported
   */
  isSupportWebGPU() {
    return isSupportWebGPU();
  }
  /**
   * Load model from a given URL (or a list of URLs, in case the model is splitted into smaller files)
   * - If the model already been downloaded (via `downloadModel()`), then we will use the cached model
   * - Else, we download the model from internet
   * @param modelSourceOrURL
   * @param params
   */
  loadModelFromUrl(_0) {
    return __async(this, arguments, function* (modelSourceOrURL, params = {}) {
      var _a;
      const source = isString(modelSourceOrURL) ? { url: modelSourceOrURL } : modelSourceOrURL;
      const useCache = (_a = params.useCache) != null ? _a : true;
      const model = useCache ? yield this.modelManager.getModelOrDownload(source, params) : yield this.modelManager.downloadModel(source, params);
      const blobs = yield model.open();
      return yield this.loadModel(blobs, params);
    });
  }
  /**
   * Load model from a given Hugging Face model ID and file path.
   *
   * @param hfOptions
   * @param params
   */
  loadModelFromHF(_0) {
    return __async(this, arguments, function* (hfOptions, params = {}) {
      const source = yield getHFModelSource(hfOptions);
      return yield this.loadModelFromUrl(source, params);
    });
  }
  /**
   * Load model from a given list of Blob.
   *
   * You can pass multiple buffers into the function (in case the model contains multiple shards).
   *
   * @param ggufBlobsOrModel Can be either list of Blobs (in case you use local file), or a Model object (in case you use ModelManager)
   * @param params LoadModelParams
   */
  loadModel(_0) {
    return __async(this, arguments, function* (ggufBlobsOrModel, params = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const blobs = ggufBlobsOrModel instanceof Model ? yield ggufBlobsOrModel.open() : [...ggufBlobsOrModel];
      if (blobs.some((b) => b.size === 0)) {
        throw new WllamaError(
          "Input model (or splits) must be non-empty Blob or File",
          "load_error"
        );
      }
      if (!this.pathConfig["default"]) {
        throw new WllamaError(
          '"default" is missing from pathConfig',
          "load_error"
        );
      }
      if (this.proxy) {
        throw new WllamaError("Module is already initialized", "load_error");
      }
      const supportMultiThread = yield isSupportMultiThread();
      const hwConccurency = Math.floor((navigator.hardwareConcurrency || 1) / 2);
      const nbThreads = (_a = params.n_threads) != null ? _a : hwConccurency;
      this.nbThreads = nbThreads;
      this.useMultiThread = supportMultiThread && nbThreads > 1;
      const workerResources = this.getWorkerResources();
      this.proxy = new ProxyToWorker(
        workerResources,
        this.useMultiThread ? nbThreads : 0,
        // 0 means disable pthread
        (_b = this.config.suppressNativeLog) != null ? _b : false,
        this.logger()
      );
      let logLevel = (_c = params.log_level) != null ? _c : 2 /* INFO */;
      if (this.config.suppressNativeLog) {
        logLevel = 9999;
      }
      const modelFiles = yield prepareBlobs(blobs);
      yield this.proxy.moduleInit(modelFiles.all);
      this.logger().debug("Calling wllamaStart...");
      const startResult = yield this.proxy.wllamaStart();
      if (!startResult.success) {
        throw new WllamaError(
          `Error while calling start function, result = ${startResult}`
        );
      }
      this.logger().debug("Loading model...");
      const loadResult = yield this.proxy.wllamaAction("load", {
        _name: "load_req",
        log_level: logLevel,
        // if async read is not supported, use mmap; refer to README-dev.md for more details
        use_mmap: !canUseAsyncFileRead(workerResources.compat),
        use_mlock: false,
        n_gpu_layers: (_d = params.n_gpu_layers) != null ? _d : 99999,
        n_ctx: (_e = params.n_ctx) != null ? _e : 1024,
        n_threads: this.useMultiThread ? nbThreads : 1,
        n_ctx_auto: false,
        // not supported for now
        mmproj_path: modelFiles.mmproj ? `/models/${MMPROJ_FILE_NAME}` : void 0,
        model_paths: modelFiles.llm.map((f) => `models/${f.name}`),
        embeddings: params.embeddings,
        offload_kqv: params.offload_kqv,
        n_batch: params.n_batch,
        pooling_type: params.pooling_type,
        rope_scaling_type: params.rope_scaling_type,
        rope_freq_base: params.rope_freq_base,
        rope_freq_scale: params.rope_freq_scale,
        yarn_ext_factor: params.yarn_ext_factor,
        yarn_attn_factor: params.yarn_attn_factor,
        yarn_beta_fast: params.yarn_beta_fast,
        yarn_beta_slow: params.yarn_beta_slow,
        yarn_orig_ctx: params.yarn_orig_ctx,
        cache_type_k: params.cache_type_k,
        cache_type_v: params.cache_type_v,
        n_parallel: 1,
        // only support single sequence for now
        kv_unified: false,
        // TODO: support kv unified cache
        flash_attn: params.flash_attn,
        swa_full: params.swa_full,
        chat_template: params.chat_template,
        jinja: params.jinja,
        reasoning: params.reasoning,
        image_min_tokens: params.image_min_tokens,
        image_max_tokens: params.image_max_tokens,
        warmup: params.warmup,
        no_kv_offload: params.no_kv_offload,
        mmproj_offload: params.mmproj_offload,
        cont_batching: params.cont_batching,
        n_keep: params.n_keep,
        ctx_shift: params.ctx_shift,
        cache_idle_slots: params.cache_idle_slots,
        n_cache_reuse: params.n_cache_reuse,
        lora_paths: (_f = params.lora_adapters) == null ? void 0 : _f.map((a) => a.path),
        lora_scales: (_g = params.lora_adapters) == null ? void 0 : _g.map((a) => {
          var _a2;
          return (_a2 = a.scale) != null ? _a2 : 1;
        }),
        lora_init_without_apply: params.lora_init_without_apply,
        spec_draft_model: params.spec_draft_model,
        spec_draft_ngl: params.spec_draft_ngl,
        spec_draft_n_max: params.spec_draft_n_max,
        spec_draft_n_min: params.spec_draft_n_min,
        spec_draft_p_min: params.spec_draft_p_min,
        spec_draft_threads: params.spec_draft_threads,
        spec_draft_threads_batch: params.spec_draft_threads_batch,
        kv_overrides_keys: params.kv_overrides ? Object.keys(params.kv_overrides) : void 0,
        kv_overrides_vals: params.kv_overrides ? Object.values(params.kv_overrides) : void 0,
        reasoning_budget_tokens: params.reasoning_budget_tokens,
        reasoning_budget_message: params.reasoning_budget_message,
        reasoning_format: params.reasoning_format,
        skip_chat_parsing: params.skip_chat_parsing,
        prefill_assistant: params.prefill_assistant
      });
      const loadedCtxInfo = __spreadProps(__spreadValues({}, loadResult), {
        metadata: {}
      });
      for (let i = 0; i < loadResult.metadata_key.length; i++) {
        loadedCtxInfo.metadata[loadResult.metadata_key[i]] = loadResult.metadata_val[i];
      }
      this.seed = params.seed;
      this.bosToken = loadedCtxInfo.token_bos;
      this.eosToken = loadedCtxInfo.token_eos;
      this.eotToken = loadedCtxInfo.token_eot;
      this.useEmbeddings = !!params.embeddings;
      this.useRerank = params.pooling_type == "rank";
      this.metadata = {
        hparams: {
          nVocab: loadedCtxInfo.n_vocab,
          nCtxTrain: loadedCtxInfo.n_ctx_train,
          nEmbd: loadedCtxInfo.n_embd,
          nLayer: loadedCtxInfo.n_layer
        },
        meta: loadedCtxInfo.metadata
      };
      this.hasEncoder = !!loadedCtxInfo.has_encoder;
      this.decoderStartToken = loadedCtxInfo.token_decoder_start;
      this.addBosToken = loadedCtxInfo.add_bos_token;
      this.addEosToken = loadedCtxInfo.add_eos_token;
      this.chatTemplate = loadedCtxInfo.metadata["tokenizer.chat_template"];
      this.loadedContextInfo = loadedCtxInfo;
      this.eogTokens = new Set(loadedCtxInfo.list_tokens_eog);
      this.mediaMarker = loadedCtxInfo.media_marker;
      this.chatTemplateKwargs = (_h = params.default_template_kwargs) != null ? _h : {};
      this.logger().debug({ loadedCtxInfo });
    });
  }
  getLoadedContextInfo() {
    this.checkModelLoaded();
    if (!this.loadedContextInfo) {
      throw new WllamaError("Loaded context info is not available");
    }
    return __spreadValues({}, this.loadedContextInfo);
  }
  //////////////////////////////////////////////
  // High level API
  /**
   * Calculate embedding vector for a given text.
   * By default, BOS and EOS tokens will be added automatically. You can use the "skipBOS" and "skipEOS" option to disable it.
   * @param options OAI-compatible embedding creation options
   * @returns OAI-compatible embedding response
   */
  createEmbedding(options) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      if (!this.useEmbeddings) {
        throw new WllamaError(
          "Embeddings is not enabled. Please set it via LoadModelParams.embeddings"
        );
      }
      const result = yield this.proxy.wllamaAction(
        "embedding",
        {
          _name: "embd_req",
          data_json: JSON.stringify(options),
          files: []
          // TODO: support file input
        }
      );
      if (!result.success) {
        throw new WllamaError(
          "Model failed to start inference",
          "inference_error"
        );
      }
      return yield this.getResponse(options, false);
    });
  }
  /**
   * Rerank a list of documents against a query.
   * Requires the model to be loaded with embeddings: true and pooling_type: 'rank'.
   * @param options Reranking options (query, documents, top_n)
   * @returns Reranking response with relevance scores sorted highest first
   */
  createRerank(options) {
    return __async(this, null, function* () {
      var _a, _b;
      this.checkModelLoaded();
      if (!this.useEmbeddings || !this.useRerank) {
        throw new WllamaError(
          "Rerank is not enabled. Please set it via LoadModelParams: embeddings = true and pooling_type = rank"
        );
      }
      const top_n = (_a = options.top_n) != null ? _a : options.documents.length;
      let totalTokens = 0;
      const rawResults = [];
      for (let i = 0; i < options.documents.length; i++) {
        const result = yield this.proxy.wllamaAction("rerank", {
          _name: "rrnk_req",
          data_json: JSON.stringify({
            query: options.query,
            document: options.documents[i]
          })
        });
        if (!result.success) {
          throw new WllamaError(
            "Model failed to start reranking",
            "inference_error"
          );
        }
        const { score, tokens_evaluated } = yield this.getRerankResult();
        totalTokens += tokens_evaluated;
        rawResults.push({ index: i, score });
      }
      rawResults.sort((a, b) => b.score - a.score);
      return {
        model: (_b = this.getModelMetadata().meta["general.name"]) != null ? _b : "",
        object: "list",
        usage: { prompt_tokens: totalTokens, total_tokens: totalTokens },
        results: rawResults.slice(0, top_n).map(({ index, score }) => ({
          index,
          relevance_score: score
        }))
      };
    });
  }
  createChatCompletion(options) {
    return __async(this, null, function* () {
      var _a;
      if (Object.keys(this.chatTemplateKwargs).length > 0) {
        options = __spreadProps(__spreadValues({}, options), {
          chat_template_kwargs: __spreadValues(__spreadValues({}, this.chatTemplateKwargs), (_a = options.chat_template_kwargs) != null ? _a : {})
        });
      }
      if (options.stream && options.onData) {
        yield this.createCompletionImpl(options);
      } else if (options.stream) {
        return yield this.createCompletionGenerator(options);
      } else {
        return yield this.createCompletionImpl(__spreadProps(__spreadValues({}, options), { stream: false }));
      }
    });
  }
  createCompletion(options) {
    return __async(this, null, function* () {
      if (options.stream && options.onData) {
        yield this.createCompletionImpl(options);
      } else if (options.stream) {
        return yield this.createCompletionGenerator(options);
      } else {
        return yield this.createCompletionImpl(__spreadProps(__spreadValues({}, options), { stream: false }));
      }
    });
  }
  /**
   * Private implementation of createCompletion
   */
  createCompletionImpl(options) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      const isStream = !!options.stream;
      const isChat = !!options.messages;
      const customOpt = {};
      if (this.seed !== void 0) {
        customOpt.seed = this.seed;
      }
      let files = [];
      if (isChat) {
        const tmp = this.prepareMultimodalInput(
          options
        );
        options = tmp.params;
        files = tmp.files;
      }
      const result = yield this.proxy.wllamaAction(
        "completion",
        {
          _name: "cmpl_req",
          is_chat: isChat,
          data_json: JSON.stringify(__spreadValues(__spreadValues({}, options), customOpt)),
          files: files.map((f) => new Uint8Array(f))
        }
      );
      if (!result.success) {
        throw new WllamaError(
          "Model failed to start inference",
          "inference_error"
        );
      }
      return yield this.getResponse(
        options,
        isStream
      );
    });
  }
  /**
   * Same with `createCompletion`, but returns an async iterator instead.
   * Only called when stream=true and no onData is provided.
   */
  createCompletionGenerator(options) {
    return new Promise((resolve) => {
      const createGenerator = cbToAsyncIter(
        (callback) => {
          this.createCompletionImpl(__spreadProps(__spreadValues({}, options), {
            onData: (chunk) => callback(chunk)
          })).then(() => callback(void 0, true)).catch((err) => callback(void 0, false, err));
        }
      );
      resolve(createGenerator());
    });
  }
  /**
   * Whether the currently loaded model supports a specific input modality (e.g. image or audio).
   * @param modality
   * @returns
   */
  supportInputModality(modality) {
    this.checkModelLoaded();
    if (modality === "image") {
      return !!this.loadedContextInfo.has_image_input;
    } else if (modality === "audio") {
      return !!this.loadedContextInfo.has_audio_input;
    } else {
      throw new WllamaError(
        "Unsupported modality: " + modality,
        "unknown_error"
      );
    }
  }
  /**
   * Unload the model and free all memory.
   *
   * Note: This function will NOT crash if model is not yet loaded
   */
  exit() {
    return __async(this, null, function* () {
      var _a;
      yield (_a = this.proxy) == null ? void 0 : _a.wllamaExit();
      this.proxy = null;
    });
  }
  /**
   * [FOR DEBUGGING ONLY] Run ggml backend ops tests without loading any model.
   *
   * Initializes the wasm runtime, executes `test-backend-ops` with the given args, then shuts down.
   *
   * For more info, please refer to guides/debug.md
   *
   * @param args Arguments forwarded to test-backend-ops (e.g. ["-o", "ADD"])
   * @returns retcode (0 = all tests passed) and success flag
   */
  testBackendOps() {
    return __async(this, arguments, function* (args = []) {
      var _a;
      if (!this.pathConfig["default"]) {
        throw new WllamaError(
          '"default" is missing from pathConfig',
          "load_error"
        );
      }
      if (!(yield isSupportMultiThread())) {
        throw new WllamaError(
          "Multi-threading is required to run backend ops tests, but it is not supported in the current environment."
        );
      }
      const tmpProxy = new ProxyToWorker(
        this.getWorkerResources(),
        0,
        // single-thread; no model needed
        (_a = this.config.suppressNativeLog) != null ? _a : false,
        this.logger()
      );
      try {
        yield tmpProxy.moduleInit([]);
        const startResult = yield tmpProxy.wllamaStart();
        if (!startResult.success) {
          throw new WllamaError(
            `Error while calling start function, result = ${startResult}`
          );
        }
        const result = yield tmpProxy.wllamaAction(
          "test_backend_ops",
          { _name: "tbop_req", args: ["test-backend-ops", ...args] }
        );
        return { retcode: result.retcode, success: result.success };
      } finally {
        yield tmpProxy.wllamaExit();
      }
    });
  }
  //////////////////////////////////////////////
  // Low level API
  // TODO: add back
  /**
   * get debug info
   */
  _getDebugInfo() {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      return yield this.proxy.wllamaDebug();
    });
  }
  //////////////////////////////////////////////
  // Utils
  jsonDecode(data_json) {
    try {
      return JSON.parse(data_json);
    } catch (e) {
      this.logger().error("Failed to parse JSON:", data_json);
      throw new WllamaError("Failed to parse model output", "inference_error");
    }
  }
  prepareMultimodalInput(params) {
    const msg = params.messages;
    const msgNew = [];
    const files = [];
    for (const m of msg) {
      if (Array.isArray(m.content)) {
        const newContent = [];
        for (const c of m.content) {
          if (c.type === "text") {
            newContent.push(c);
          } else {
            if (!this.mediaMarker) {
              throw new WllamaError(
                "Media marker is undefined",
                "inference_error"
              );
            }
            files.push(c.data);
            newContent.push({
              type: "text",
              text: this.mediaMarker
            });
          }
        }
        msgNew.push(__spreadProps(__spreadValues({}, m), {
          content: newContent
        }));
      } else {
        msgNew.push(m);
      }
    }
    return {
      params: __spreadProps(__spreadValues({}, params), {
        messages: msgNew
      }),
      files
    };
  }
  getRerankResult() {
    return __async(this, null, function* () {
      while (true) {
        const chunk = yield this.proxy.wllamaAction(
          "get_result",
          { _name: "gres_req" }
        );
        const jsonString = chunk.data_json;
        if (jsonString && jsonString.length > 0) {
          if (chunk.is_error) {
            const jsonData = this.jsonDecode(jsonString);
            throw new WllamaError(
              jsonData.message || "Unknown reranking error",
              "inference_error"
            );
          }
          return this.jsonDecode(jsonString);
        }
        if (!chunk.has_more) break;
      }
      throw new WllamaError("No reranking result received", "inference_error");
    });
  }
  getResponse(options, isStream) {
    return __async(this, null, function* () {
      var _a, _b;
      let finalResult = null;
      while (true) {
        if ((_a = options.abortSignal) == null ? void 0 : _a.aborted) {
          throw new WllamaAbortError();
        }
        const result_chunk = yield this.proxy.wllamaAction(
          "get_result",
          {
            _name: "gres_req"
          }
        );
        const jsonString = result_chunk.data_json;
        if (!jsonString || jsonString.length === 0) {
          if (!result_chunk.has_more) {
            break;
          } else {
            continue;
          }
        }
        if (jsonString == "null") {
          continue;
        }
        let jsonData = this.jsonDecode(jsonString);
        finalResult = jsonData;
        if (result_chunk.is_error) {
          this.logger().error("Model returned an error:", jsonData);
          throw new WllamaError(
            jsonData.message || "Unknown inference error",
            "inference_error"
          );
        }
        if (isStream) {
          if (!Array.isArray(jsonData)) {
            jsonData = [jsonData];
          }
          for (const chunk of jsonData) {
            (_b = options.onData) == null ? void 0 : _b.call(options, chunk);
            finalResult = chunk;
          }
        }
        if (!result_chunk.has_more) {
          break;
        }
      }
      return finalResult;
    });
  }
  getWorkerResources() {
    const workerResources = {
      wasmPath: absoluteUrl(this.pathConfig["default"]),
      compat: false
    };
    if (needCompat()) {
      if (!this.compat) {
        this.logger().warn(
          "Not using compat mode" + (isFirefox() ? " (expected on Firefox - WebGPU will be disabled)" : "")
        );
      } else {
        const isUsingDefault = this.compat.worker === WasmCompatFromCDN.worker && this.compat.wasm === WasmCompatFromCDN.wasm;
        if (isUsingDefault) {
          this.logger().warn(
            "Compatibility mode is activated, using resources from CDN. To use local resources, please refer to @wllama/wllama-compat package."
          );
          this.logger().warn(
            "IMPORTANT: Performance will be significantly degraded in compatibility mode."
          );
        }
        workerResources.wasmPath = absoluteUrl(this.compat.wasm);
        workerResources.jsPath = this.compat.worker;
        workerResources.compat = true;
      }
    }
    if (isFirefox()) {
      if (workerResources.compat) {
        this.logger().warn(
          'Using compat mode on Firefox, performance will be significantly degraded; Consider enabling "javascript.options.wasm_js_promise_integration" in "about:config".'
        );
      } else if (!isSupportJSPI()) {
        this.logger().warn(
          'WebGPU is disabled on Firefox due to missing JSPI support. Please consider enabling compat mode, or enabling "javascript.options.wasm_js_promise_integration" in "about:config".'
        );
      }
    }
    return workerResources;
  }
};
export {
  CacheManager,
  LogLevel,
  LoggerWithoutDebug,
  Model,
  ModelManager,
  ModelValidationStatus,
  POLYFILL_ETAG,
  Wllama,
  WllamaAbortError,
  WllamaError,
  WllamaRuntimeError,
  getHFModelSource,
  isValidGgufFile
};
