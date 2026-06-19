var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn2, res) => function __init() {
  return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-gDRb5B/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-gDRb5B/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/slack-edge/dist/request/request-parser.js
var require_request_parser = __commonJS({
  "node_modules/slack-edge/dist/request/request-parser.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseRequestBody = parseRequestBody;
    async function parseRequestBody(requestHeaders, requestBody) {
      const contentType = requestHeaders.get("content-type");
      if (contentType?.startsWith("application/json") || requestBody.startsWith("{")) {
        return JSON.parse(requestBody);
      }
      const params = new URLSearchParams(requestBody);
      if (params.has("payload")) {
        const payload = params.get("payload");
        return JSON.parse(payload);
      }
      const formBody = {};
      for (const k5 of params.keys()) {
        formBody[k5] = params.get(k5);
      }
      return formBody;
    }
  }
});

// node_modules/slack-edge/dist/request/request-verification.js
var require_request_verification = __commonJS({
  "node_modules/slack-edge/dist/request/request-verification.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifySlackRequest = verifySlackRequest;
    async function verifySlackRequest(signingSecret, requestHeaders, requestBody) {
      const timestampHeader = requestHeaders.get("x-slack-request-timestamp");
      if (!timestampHeader) {
        console.log("x-slack-request-timestamp header is missing!");
        return false;
      }
      const fiveMinutesAgoSeconds = Math.floor(Date.now() / 1e3) - 60 * 5;
      if (Number.parseInt(timestampHeader) < fiveMinutesAgoSeconds) {
        return false;
      }
      const signatureHeader = requestHeaders.get("x-slack-signature");
      if (!timestampHeader || !signatureHeader) {
        console.log("x-slack-signature header is missing!");
        return false;
      }
      const textEncoder = new TextEncoder();
      return await crypto.subtle.verify("HMAC", await crypto.subtle.importKey("raw", textEncoder.encode(signingSecret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]), fromHexStringToBytes(signatureHeader.substring(3)), textEncoder.encode(`v0:${timestampHeader}:${requestBody}`));
    }
    function fromHexStringToBytes(hexString) {
      const bytes = new Uint8Array(hexString.length / 2);
      for (let idx = 0; idx < hexString.length; idx += 2) {
        bytes[idx / 2] = parseInt(hexString.substring(idx, idx + 2), 16);
      }
      return bytes;
    }
  }
});

// node_modules/slack-edge/dist/response/response.js
var require_response = __commonJS({
  "node_modules/slack-edge/dist/response/response.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toCompleteResponse = toCompleteResponse;
    function toCompleteResponse(slackResponse) {
      if (!slackResponse) {
        return new Response("", {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }
      if (typeof slackResponse === "string") {
        return new Response(slackResponse, {
          status: 200,
          headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
      }
      let completeResponse = {};
      if (Object.prototype.hasOwnProperty.call(slackResponse, "text") || Object.prototype.hasOwnProperty.call(slackResponse, "blocks")) {
        completeResponse = { status: 200, body: slackResponse };
      } else if (Object.prototype.hasOwnProperty.call(slackResponse, "response_action")) {
        completeResponse = { status: 200, body: slackResponse };
      } else if (Object.prototype.hasOwnProperty.call(slackResponse, "options") || Object.prototype.hasOwnProperty.call(slackResponse, "option_groups")) {
        completeResponse = { status: 200, body: slackResponse };
      } else {
        completeResponse = slackResponse;
      }
      const status = completeResponse.status ? completeResponse.status : 200;
      let contentType = completeResponse.contentType ? completeResponse.contentType : "text/plain;charset=utf-8";
      let bodyString = "";
      if (typeof completeResponse.body === "object") {
        contentType = "application/json;charset=utf-8";
        bodyString = JSON.stringify(completeResponse.body);
      } else {
        bodyString = completeResponse.body || "";
      }
      return new Response(bodyString, {
        status,
        headers: { "Content-Type": contentType }
      });
    }
  }
});

// node_modules/slack-web-api-client/dist/block-kit/block-elements.js
var require_block_elements = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/block-elements.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/blocks.js
var require_blocks = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/blocks.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/confirm.js
var require_confirm = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/confirm.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/link-unfurls.js
var require_link_unfurls = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/link-unfurls.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/message-attachment.js
var require_message_attachment = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/message-attachment.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/message-metadata.js
var require_message_metadata = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/message-metadata.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/options.js
var require_options = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/options.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/text-fields.js
var require_text_fields = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/text-fields.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/rich-text-block.js
var require_rich_text_block = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/rich-text-block.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/block-kit/views.js
var require_views = __commonJS({
  "node_modules/slack-web-api-client/dist/block-kit/views.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/client/api-client-options.js
var require_api_client_options = __commonJS({
  "node_modules/slack-web-api-client/dist/client/api-client-options.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/errors.js
var require_errors = __commonJS({
  "node_modules/slack-web-api-client/dist/errors.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebhookError = exports.TokenRotationError = exports.SlackAPIError = exports.SlackAPIConnectionError = void 0;
    var SlackAPIConnectionError = class extends Error {
      constructor(apiName, status, body, headers, cause) {
        const substring = body.replaceAll("\r", "").replaceAll("\n", "").substring(0, 100);
        const bodyToPrint = substring.length === 1e3 ? substring + " ..." : substring;
        const message = cause !== void 0 ? `Failed to call ${apiName} (cause: ${cause})` : `Failed to call ${apiName} (status: ${status}, body: ${bodyToPrint})`;
        super(message);
        this.name = "SlackAPIConnectionError";
        this.apiName = apiName;
        this.status = status;
        this.body = body;
        this.headers = headers;
        this.cause = cause;
      }
    };
    exports.SlackAPIConnectionError = SlackAPIConnectionError;
    var SlackAPIError = class extends Error {
      constructor(apiName, error, result) {
        const resultToPrint = JSON.stringify(result);
        const message = `Failed to call ${apiName} due to ${error}: ${resultToPrint}`;
        super(message);
        this.name = "SlackAPIError";
        this.apiName = apiName;
        this.error = error;
        this.result = result;
      }
    };
    exports.SlackAPIError = SlackAPIError;
    var TokenRotationError = class extends Error {
      constructor(message, cause) {
        super(message);
        this.name = "TokenRotationError";
        this.cause = cause;
      }
    };
    exports.TokenRotationError = TokenRotationError;
    var WebhookError = class extends Error {
      constructor(status, body, cause = void 0) {
        const message = cause ? `Failed to send a message using incoming webhook/response_url (cause: ${cause})` : `Failed to send a message using incoming webhook/response_url (status: ${status}, body: ${body})`;
        super(message);
        this.name = "WebhookError";
        this.status = status;
        this.body = body;
        this.cause = cause;
      }
    };
    exports.WebhookError = WebhookError;
  }
});

// node_modules/slack-web-api-client/dist/logging/logging-level.js
var require_logging_level = __commonJS({
  "node_modules/slack-web-api-client/dist/logging/logging-level.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/logging/debug-logging.js
var require_debug_logging = __commonJS({
  "node_modules/slack-web-api-client/dist/logging/debug-logging.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isDebugLogEnabled = isDebugLogEnabled;
    exports.prettyPrint = prettyPrint;
    function isDebugLogEnabled(logLevel) {
      return logLevel !== void 0 && logLevel !== null && logLevel.toUpperCase() === "DEBUG";
    }
    function prettyPrint(obj) {
      return JSON.stringify(obj, null, 2);
    }
  }
});

// node_modules/slack-web-api-client/dist/logging/index.js
var require_logging = __commonJS({
  "node_modules/slack-web-api-client/dist/logging/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      var desc = Object.getOwnPropertyDescriptor(m4, k5);
      if (!desc || ("get" in desc ? !m4.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m4[k5];
        } };
      }
      Object.defineProperty(o5, k22, desc);
    } : function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      o5[k22] = m4[k5];
    });
    var __exportStar = exports && exports.__exportStar || function(m4, exports2) {
      for (var p8 in m4)
        if (p8 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p8))
          __createBinding(exports2, m4, p8);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_logging_level(), exports);
    __exportStar(require_debug_logging(), exports);
  }
});

// node_modules/slack-web-api-client/dist/client/retry-handler/retry-handler.js
var require_retry_handler = __commonJS({
  "node_modules/slack-web-api-client/dist/client/retry-handler/retry-handler.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/client/retry-handler/built-in.js
var require_built_in = __commonJS({
  "node_modules/slack-web-api-client/dist/client/retry-handler/built-in.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f7) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f7.call(receiver, value) : f7 ? f7.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _RatelimitRetryHandler_maxAttempts;
    var _ConnectionErrorRetryHandler_maxAttempts;
    var _ConnectionErrorRetryHandler_intervalSeconds;
    var _ServerErrorRetryHandler_maxAttempts;
    var _ServerErrorRetryHandler_intervalSeconds;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServerErrorRetryHandler = exports.ConnectionErrorRetryHandler = exports.RatelimitRetryHandler = exports.DefaultFixedIntervalRetryHandlerOptions = exports.DefaultBasicRetryHandlerOptions = void 0;
    var errors_1 = require_errors();
    exports.DefaultBasicRetryHandlerOptions = {
      maxAttempts: 1
    };
    exports.DefaultFixedIntervalRetryHandlerOptions = {
      maxAttempts: 1,
      intervalSeconds: 0.3
    };
    var RatelimitRetryHandler = class {
      constructor(options = exports.DefaultBasicRetryHandlerOptions) {
        _RatelimitRetryHandler_maxAttempts.set(this, void 0);
        __classPrivateFieldSet(this, _RatelimitRetryHandler_maxAttempts, options.maxAttempts, "f");
      }
      async shouldRetry({ state, response }) {
        if (state.currentAttempt >= __classPrivateFieldGet(this, _RatelimitRetryHandler_maxAttempts, "f") || !response) {
          return false;
        }
        if (response.status !== 429) {
          return false;
        }
        const retryAfter = response.headers.get("retry-after") || response.headers.get("Retry-After");
        if (!retryAfter || Number.isNaN(retryAfter)) {
          return false;
        }
        const sleepSeconds = Number.parseFloat(retryAfter);
        await sleep(sleepSeconds);
        return true;
      }
    };
    exports.RatelimitRetryHandler = RatelimitRetryHandler;
    _RatelimitRetryHandler_maxAttempts = /* @__PURE__ */ new WeakMap();
    var ConnectionErrorRetryHandler = class {
      constructor(options = exports.DefaultFixedIntervalRetryHandlerOptions) {
        _ConnectionErrorRetryHandler_maxAttempts.set(this, void 0);
        _ConnectionErrorRetryHandler_intervalSeconds.set(this, void 0);
        __classPrivateFieldSet(this, _ConnectionErrorRetryHandler_maxAttempts, options.maxAttempts, "f");
        __classPrivateFieldSet(this, _ConnectionErrorRetryHandler_intervalSeconds, options.intervalSeconds, "f");
      }
      async shouldRetry({ state, error }) {
        if (state.currentAttempt >= __classPrivateFieldGet(this, _ConnectionErrorRetryHandler_maxAttempts, "f") || !error) {
          return false;
        }
        if (error instanceof errors_1.SlackAPIConnectionError) {
          await sleep(__classPrivateFieldGet(this, _ConnectionErrorRetryHandler_intervalSeconds, "f"));
          return true;
        }
        return false;
      }
    };
    exports.ConnectionErrorRetryHandler = ConnectionErrorRetryHandler;
    _ConnectionErrorRetryHandler_maxAttempts = /* @__PURE__ */ new WeakMap(), _ConnectionErrorRetryHandler_intervalSeconds = /* @__PURE__ */ new WeakMap();
    var ServerErrorRetryHandler = class {
      constructor(options = exports.DefaultFixedIntervalRetryHandlerOptions) {
        _ServerErrorRetryHandler_maxAttempts.set(this, void 0);
        _ServerErrorRetryHandler_intervalSeconds.set(this, void 0);
        __classPrivateFieldSet(this, _ServerErrorRetryHandler_maxAttempts, options.maxAttempts, "f");
        __classPrivateFieldSet(this, _ServerErrorRetryHandler_intervalSeconds, options.intervalSeconds, "f");
      }
      async shouldRetry({ state, response }) {
        if (state.currentAttempt >= __classPrivateFieldGet(this, _ServerErrorRetryHandler_maxAttempts, "f") || !response) {
          return false;
        }
        if (response.status >= 500) {
          await sleep(__classPrivateFieldGet(this, _ServerErrorRetryHandler_intervalSeconds, "f"));
          return true;
        }
        return false;
      }
    };
    exports.ServerErrorRetryHandler = ServerErrorRetryHandler;
    _ServerErrorRetryHandler_maxAttempts = /* @__PURE__ */ new WeakMap(), _ServerErrorRetryHandler_intervalSeconds = /* @__PURE__ */ new WeakMap();
    var sleep = (seconds) => {
      return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
    };
  }
});

// node_modules/slack-web-api-client/dist/client/retry-handler/index.js
var require_retry_handler2 = __commonJS({
  "node_modules/slack-web-api-client/dist/client/retry-handler/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      var desc = Object.getOwnPropertyDescriptor(m4, k5);
      if (!desc || ("get" in desc ? !m4.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m4[k5];
        } };
      }
      Object.defineProperty(o5, k22, desc);
    } : function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      o5[k22] = m4[k5];
    });
    var __exportStar = exports && exports.__exportStar || function(m4, exports2) {
      for (var p8 in m4)
        if (p8 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p8))
          __createBinding(exports2, m4, p8);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_retry_handler(), exports);
    __exportStar(require_built_in(), exports);
  }
});

// node_modules/slack-web-api-client/dist/client/api-client.js
var require_api_client = __commonJS({
  "node_modules/slack-web-api-client/dist/client/api-client.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f7) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f7.call(receiver, value) : f7 ? f7.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _SlackAPIClient_instances;
    var _a;
    var _SlackAPIClient_token;
    var _SlackAPIClient_options;
    var _SlackAPIClient_logLevel;
    var _SlackAPIClient_throwSlackAPIError;
    var _SlackAPIClient_baseUrl;
    var _SlackAPIClient_sendMultipartData;
    var _SlackAPIClient_uploadFilesV2;
    var _SlackAPIClient_bindApiCall;
    var _SlackAPIClient_bindNoArgAllowedApiCall;
    var _SlackAPIClient_bindMultipartApiCall;
    var _SlackAPIClient_bindFilesUploadV2;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlackAPIClient = void 0;
    var errors_1 = require_errors();
    var index_1 = require_logging();
    var index_2 = require_retry_handler2();
    var defaultOptions = {
      logLevel: "INFO",
      throwSlackAPIError: true,
      baseUrl: "https://slack.com/api/"
    };
    var SlackAPIClient = class {
      constructor(token = void 0, options = defaultOptions) {
        _SlackAPIClient_instances.add(this);
        _SlackAPIClient_token.set(this, void 0);
        _SlackAPIClient_options.set(this, void 0);
        _SlackAPIClient_logLevel.set(this, void 0);
        _SlackAPIClient_throwSlackAPIError.set(this, void 0);
        _SlackAPIClient_baseUrl.set(this, void 0);
        this.admin = {
          apps: {
            approve: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.apps.approve"),
            approved: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.apps.approved.list")
            },
            clearResolution: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.apps.clearResolution"),
            requests: {
              cancel: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.apps.requests.cancel"),
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.apps.requests.list")
            },
            restrict: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.apps.restrict"),
            restricted: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.apps.restricted.list")
            },
            uninstall: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.apps.uninstall"),
            activities: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.apps.activities.list")
            }
          },
          auth: {
            policy: {
              assignEntities: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.auth.policy.assignEntities"),
              getEntities: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.auth.policy.getEntities"),
              removeEntities: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.auth.policy.removeEntities")
            }
          },
          barriers: {
            create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.barriers.create"),
            delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.barriers.delete"),
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.barriers.list"),
            update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.barriers.update")
          },
          conversations: {
            archive: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.archive"),
            bulkArchive: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.bulkArchive"),
            bulkDelete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.bulkDelete"),
            bulkMove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.bulkMove"),
            convertToPrivate: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.convertToPrivate"),
            convertToPublic: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.convertToPublic"),
            create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.create"),
            delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.delete"),
            disconnectShared: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.disconnectShared"),
            ekm: {
              listOriginalConnectedChannelInfo: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.conversations.ekm.listOriginalConnectedChannelInfo")
            },
            getConversationPrefs: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.getConversationPrefs"),
            getTeams: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.getTeams"),
            invite: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.invite"),
            rename: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.rename"),
            restrictAccess: {
              addGroup: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.restrictAccess.addGroup"),
              listGroups: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.restrictAccess.listGroups"),
              removeGroup: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.restrictAccess.removeGroup")
            },
            getCustomRetention: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.getCustomRetention"),
            setCustomRetention: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.setCustomRetention"),
            removeCustomRetention: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.removeCustomRetention"),
            lookup: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.lookup"),
            search: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.conversations.search"),
            setConversationPrefs: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.setConversationPrefs"),
            setTeams: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.setTeams"),
            unarchive: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.conversations.unarchive")
          },
          emoji: {
            add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.emoji.add"),
            addAlias: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.emoji.addAlias"),
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.emoji.list"),
            remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.emoji.remove"),
            rename: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.emoji.rename")
          },
          functions: {
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.functions.list"),
            permissions: {
              lookup: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.functions.permissions.lookup"),
              set: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.functions.permissions.set")
            }
          },
          inviteRequests: {
            approve: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.inviteRequests.approve"),
            approved: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.inviteRequests.approved.list")
            },
            denied: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.inviteRequests.denied.list")
            },
            deny: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.inviteRequests.deny"),
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.inviteRequests.list")
          },
          roles: {
            addAssignments: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.roles.addAssignments"),
            listAssignments: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.roles.listAssignments"),
            removeAssignments: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.roles.removeAssignments")
          },
          teams: {
            admins: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.admins.list")
            },
            create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.create"),
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.teams.list"),
            owners: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.owners.list")
            },
            settings: {
              info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.settings.info"),
              setDefaultChannels: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.settings.setDefaultChannels"),
              setDescription: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.settings.setDescription"),
              setDiscoverability: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.settings.setDiscoverability"),
              setIcon: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.settings.setIcon"),
              setName: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.teams.settings.setName")
            }
          },
          usergroups: {
            addChannels: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.usergroups.addChannels"),
            addTeams: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.usergroups.addTeams"),
            listChannels: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.usergroups.listChannels"),
            removeChannels: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.usergroups.removeChannels")
          },
          users: {
            assign: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.assign"),
            invite: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.invite"),
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.list"),
            remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.remove"),
            session: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.users.session.list"),
              reset: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.session.reset"),
              resetBulk: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.session.resetBulk"),
              invalidate: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.session.invalidate"),
              getSettings: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.session.getSettings"),
              setSettings: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.session.setSettings"),
              clearSettings: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.session.clearSettings")
            },
            unsupportedVersions: {
              export: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.users.unsupportedVersions.export")
            },
            setAdmin: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.setAdmin"),
            setExpiration: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.setExpiration"),
            setOwner: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.setOwner"),
            setRegular: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.users.setRegular")
          },
          workflows: {
            search: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "admin.workflows.search"),
            unpublish: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.workflows.unpublish"),
            collaborators: {
              add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.workflows.collaborators.add"),
              remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.workflows.collaborators.remove")
            },
            permissions: {
              lookup: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "admin.workflows.permissions.lookup")
            }
          }
        };
        this.api = {
          test: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "api.test")
        };
        this.apps = {
          connections: {
            open: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "apps.connections.open")
          },
          datastore: {
            put: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.datastore.put"),
            update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.datastore.update"),
            get: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.datastore.get"),
            query: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.datastore.query"),
            delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.datastore.delete")
          },
          event: {
            authorizations: {
              list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.event.authorizations.list")
            }
          },
          manifest: {
            create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.manifest.create"),
            delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.manifest.delete"),
            update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.manifest.update"),
            export: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.manifest.export"),
            validate: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.manifest.validate")
          },
          uninstall: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "apps.uninstall")
        };
        this.auth = {
          revoke: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "auth.revoke"),
          teams: {
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "auth.teams.list")
          },
          test: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "auth.test")
        };
        this.bots = {
          info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "bots.info")
        };
        this.bookmarks = {
          add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "bookmarks.add"),
          edit: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "bookmarks.edit"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "bookmarks.list"),
          remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "bookmarks.remove")
        };
        this.canvases = {
          access: {
            delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "canvases.access.delete"),
            set: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "canvases.access.set")
          },
          create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "canvases.create"),
          edit: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "canvases.edit"),
          delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "canvases.delete"),
          sections: {
            lookup: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "canvases.sections.lookup")
          }
        };
        this.chat = {
          delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.delete"),
          deleteScheduledMessage: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.deleteScheduledMessage"),
          getPermalink: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.getPermalink"),
          meMessage: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.meMessage"),
          postEphemeral: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.postEphemeral"),
          postMessage: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.postMessage"),
          scheduleMessage: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.scheduleMessage"),
          scheduledMessages: {
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.scheduledMessages.list")
          },
          unfurl: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.unfurl"),
          update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "chat.update")
        };
        this.conversations = {
          acceptSharedInvite: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.acceptSharedInvite"),
          approveSharedInvite: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.approveSharedInvite"),
          archive: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.archive"),
          close: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.close"),
          create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.create"),
          declineSharedInvite: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.declineSharedInvite"),
          history: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.history"),
          info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.info"),
          invite: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.invite"),
          inviteShared: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.inviteShared"),
          join: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.join"),
          kick: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.kick"),
          leave: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.leave"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "conversations.list"),
          listConnectInvites: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "conversations.listConnectInvites"),
          mark: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.mark"),
          members: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.members"),
          open: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "conversations.open"),
          rename: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.rename"),
          replies: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.replies"),
          setPurpose: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.setPurpose"),
          setTopic: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.setTopic"),
          unarchive: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.unarchive"),
          canvases: {
            create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.canvases.create")
          },
          externalInvitePermissions: {
            set: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "conversations.externalInvitePermissions.set")
          }
        };
        this.dnd = {
          endDnd: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "dnd.endDnd"),
          endSnooze: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "dnd.endSnooze"),
          info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "dnd.info"),
          setSnooze: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "dnd.setSnooze"),
          teamInfo: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "dnd.teamInfo")
        };
        this.emoji = {
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "emoji.list")
        };
        this.files = {
          delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.delete"),
          info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.info"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "files.list"),
          revokePublicURL: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.revokePublicURL"),
          sharedPublicURL: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.sharedPublicURL"),
          /**
           * @deprecated use files.uploadV2 instead
           */
          upload: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindMultipartApiCall).call(this, this, "files.upload"),
          uploadV2: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindFilesUploadV2).call(this, this),
          getUploadURLExternal: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.getUploadURLExternal"),
          completeUploadExternal: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.completeUploadExternal"),
          remote: {
            info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "files.remote.info"),
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "files.remote.list"),
            add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.remote.add"),
            update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "files.remote.update"),
            remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "files.remote.remove"),
            share: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "files.remote.share")
          }
        };
        this.functions = {
          completeSuccess: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "functions.completeSuccess"),
          completeError: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "functions.completeError")
        };
        this.migration = {
          exchange: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "migration.exchange")
        };
        this.oauth = {
          v2: {
            access: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "oauth.v2.access"),
            exchange: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "oauth.v2.exchange")
          }
        };
        this.openid = {
          connect: {
            token: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "openid.connect.token"),
            userInfo: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "openid.connect.userInfo")
          }
        };
        this.pins = {
          add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "pins.add"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "pins.list"),
          remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "pins.remove")
        };
        this.reactions = {
          add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "reactions.add"),
          get: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "reactions.get"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "reactions.list"),
          remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "reactions.remove")
        };
        this.reminders = {
          add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "reminders.add"),
          complete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "reminders.complete"),
          delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "reminders.delete"),
          info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "reminders.info"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "reminders.list")
        };
        this.search = {
          all: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "search.all"),
          files: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "search.files"),
          messages: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "search.messages")
        };
        this.stars = {
          add: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "stars.add"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "stars.list"),
          remove: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "stars.remove")
        };
        this.team = {
          accessLogs: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "team.accessLogs"),
          billableInfo: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "team.billableInfo"),
          billing: {
            info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "team.billing.info")
          },
          info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "team.info"),
          integrationLogs: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "team.integrationLogs"),
          preferences: {
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "team.preferences.list")
          },
          profile: {
            get: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "team.profile.get")
          },
          externalTeams: {
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "team.externalTeams.list"),
            disconnect: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "team.externalTeams.disconnect")
          }
        };
        this.tooling = {
          tokens: {
            rotate: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "tooling.tokens.rotate")
          }
        };
        this.usergroups = {
          create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "usergroups.create"),
          disable: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "usergroups.disable"),
          enable: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "usergroups.enable"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "usergroups.list"),
          update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "usergroups.update"),
          users: {
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "usergroups.users.list"),
            update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "usergroups.users.update")
          }
        };
        this.users = {
          conversations: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "users.conversations"),
          deletePhoto: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "users.deletePhoto"),
          getPresence: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "users.getPresence"),
          identity: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "users.identity"),
          info: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "users.info"),
          list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "users.list"),
          lookupByEmail: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "users.lookupByEmail"),
          setPhoto: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "users.setPhoto"),
          setPresence: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "users.setPresence"),
          profile: {
            get: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "users.profile.get"),
            set: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "users.profile.set")
          },
          discoverableContacts: {
            lookup: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "users.discoverableContacts.lookup")
          }
        };
        this.views = {
          open: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "views.open"),
          publish: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "views.publish"),
          push: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "views.push"),
          update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "views.update")
        };
        this.workflows = {
          triggers: {
            create: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "workflows.triggers.create"),
            update: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "workflows.triggers.update"),
            delete: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindApiCall).call(this, this, "workflows.triggers.delete"),
            list: __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_bindNoArgAllowedApiCall).call(this, this, "workflows.triggers.list")
          }
        };
        __classPrivateFieldSet(this, _SlackAPIClient_token, token, "f");
        __classPrivateFieldSet(this, _SlackAPIClient_options, options, "f");
        __classPrivateFieldSet(this, _SlackAPIClient_logLevel, __classPrivateFieldGet(this, _SlackAPIClient_options, "f").logLevel ?? defaultOptions.logLevel, "f");
        __classPrivateFieldSet(this, _SlackAPIClient_throwSlackAPIError, __classPrivateFieldGet(this, _SlackAPIClient_options, "f").throwSlackAPIError ?? true, "f");
        __classPrivateFieldSet(this, _SlackAPIClient_baseUrl, __classPrivateFieldGet(this, _SlackAPIClient_options, "f").baseUrl ? __classPrivateFieldGet(this, _SlackAPIClient_options, "f").baseUrl.endsWith("/") ? __classPrivateFieldGet(this, _SlackAPIClient_options, "f").baseUrl : __classPrivateFieldGet(this, _SlackAPIClient_options, "f").baseUrl + "/" : defaultOptions.baseUrl, "f");
        this.retryHandlers = __classPrivateFieldGet(this, _SlackAPIClient_options, "f").retryHandlers ?? [new index_2.RatelimitRetryHandler()];
      }
      // --------------------------------------
      // Internal methods
      // --------------------------------------
      async call(name, params = {}, retryHandlerState = void 0) {
        const url = `${__classPrivateFieldGet(this, _SlackAPIClient_baseUrl, "f")}${name}`;
        const token = params ? params.token ?? __classPrivateFieldGet(this, _SlackAPIClient_token, "f") : __classPrivateFieldGet(this, _SlackAPIClient_token, "f");
        const _params = {};
        Object.assign(_params, params);
        if (_params && _params.token) {
          delete _params.token;
        }
        for (const [key, value] of Object.entries(_params)) {
          if (typeof value === "object") {
            if (Array.isArray(value) && value.length > 0 && typeof value[0] !== "object") {
              _params[key] = value.map((v5) => v5.toString()).join(",");
            } else {
              _params[key] = JSON.stringify(value);
            }
          }
          if (value === void 0 || value === null) {
            delete _params[key];
          }
        }
        const headers = {
          "Content-Type": "application/x-www-form-urlencoded"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const body = new URLSearchParams(_params);
        if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
          console.log(`Slack API request (${name}): ${body}`);
        }
        if (retryHandlerState) {
          retryHandlerState.currentAttempt += 1;
        }
        const state = retryHandlerState ?? {
          currentAttempt: 0,
          logLevel: __classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f")
        };
        const request = new Request(url, {
          method: "POST",
          headers,
          body
        });
        let response;
        try {
          response = await fetch(request);
          for (const rh of this.retryHandlers) {
            if (await rh.shouldRetry({ state, request, response })) {
              if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
                console.log(`Retrying ${name} API call (params: ${JSON.stringify(params)})`);
              }
              return await this.call(name, params, state);
            }
          }
        } catch (e3) {
          const error = new errors_1.SlackAPIConnectionError(name, -1, "", void 0, e3);
          for (const rh of this.retryHandlers) {
            if (await rh.shouldRetry({ state, request, error })) {
              if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
                console.log(`Retrying ${name} API call (params: ${JSON.stringify(params)})`);
              }
              return await this.call(name, params, state);
            }
          }
          throw error;
        }
        if (response.status != 200) {
          const body2 = await response.text();
          throw new errors_1.SlackAPIConnectionError(name, response.status, body2, response.headers, void 0);
        }
        const responseBody = await response.json();
        const result = {
          ...responseBody,
          headers: response.headers
        };
        if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
          console.log(`Slack API response (${name}): ${JSON.stringify(result)}}`);
        }
        if (__classPrivateFieldGet(this, _SlackAPIClient_throwSlackAPIError, "f") && result.error) {
          throw new errors_1.SlackAPIError(name, result.error, result);
        }
        return result;
      }
    };
    exports.SlackAPIClient = SlackAPIClient;
    _a = SlackAPIClient, _SlackAPIClient_token = /* @__PURE__ */ new WeakMap(), _SlackAPIClient_options = /* @__PURE__ */ new WeakMap(), _SlackAPIClient_logLevel = /* @__PURE__ */ new WeakMap(), _SlackAPIClient_throwSlackAPIError = /* @__PURE__ */ new WeakMap(), _SlackAPIClient_baseUrl = /* @__PURE__ */ new WeakMap(), _SlackAPIClient_instances = /* @__PURE__ */ new WeakSet(), _SlackAPIClient_sendMultipartData = async function _SlackAPIClient_sendMultipartData2(name, params = {}, retryHandlerState = void 0) {
      const url = `${__classPrivateFieldGet(this, _SlackAPIClient_baseUrl, "f")}${name}`;
      const token = params ? params.token ?? __classPrivateFieldGet(this, _SlackAPIClient_token, "f") : __classPrivateFieldGet(this, _SlackAPIClient_token, "f");
      const body = new FormData();
      for (const [key, value] of Object.entries(params)) {
        if (value === void 0 || value === null || key === "token") {
          continue;
        }
        if (typeof value === "object") {
          if (value instanceof Blob) {
            body.append(key, value);
          } else {
            body.append(key, new Blob([value]));
          }
        } else {
          body.append(key, value);
        }
      }
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
        const bodyParamNames = Array.from(body.keys()).join(", ");
        console.log(`Slack API request (${name}): Sending ${bodyParamNames}`);
      }
      if (retryHandlerState) {
        retryHandlerState.currentAttempt += 1;
      }
      const state = retryHandlerState ?? {
        currentAttempt: 0,
        logLevel: __classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f")
      };
      const request = new Request(url, {
        method: "POST",
        headers,
        body
      });
      let response;
      try {
        response = await fetch(request);
        for (const rh of this.retryHandlers) {
          if (await rh.shouldRetry({ state, request, response })) {
            if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
              console.log(`Retrying ${name} API call`);
            }
            return await __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_sendMultipartData2).call(this, name, params, state);
          }
        }
      } catch (e3) {
        const error = new errors_1.SlackAPIConnectionError(name, -1, "", void 0, e3);
        for (const rh of this.retryHandlers) {
          if (await rh.shouldRetry({ state, request, error })) {
            if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
              console.log(`Retrying ${name} API call`);
            }
            return await __classPrivateFieldGet(this, _SlackAPIClient_instances, "m", _SlackAPIClient_sendMultipartData2).call(this, name, params, state);
          }
        }
        throw error;
      }
      if (response.status != 200) {
        const body2 = await response.text();
        throw new errors_1.SlackAPIConnectionError(name, response.status, body2, response.headers, void 0);
      }
      const responseBody = await response.json();
      const result = {
        ...responseBody,
        headers: response.headers
      };
      if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(this, _SlackAPIClient_logLevel, "f"))) {
        console.log(`Slack API response (${name}): ${JSON.stringify(result)}}`);
      }
      if (__classPrivateFieldGet(this, _SlackAPIClient_throwSlackAPIError, "f") && result.error) {
        throw new errors_1.SlackAPIError(name, result.error, result);
      }
      return result;
    }, _SlackAPIClient_uploadFilesV2 = async function _SlackAPIClient_uploadFilesV22(params) {
      const files = "files" in params ? params.files : [{ ...params }];
      const completes = [];
      const uploadErrors = [];
      const client = new _a(params.token ?? __classPrivateFieldGet(this, _SlackAPIClient_token, "f"), {
        logLevel: __classPrivateFieldGet(this, _SlackAPIClient_options, "f").logLevel,
        throwSlackAPIError: true
        // intentionally set to true for uploadAsync()
      });
      for (const f7 of files) {
        async function uploadAsync() {
          const body = f7.file ? new Uint8Array(f7.file instanceof Blob ? await f7.file.arrayBuffer() : f7.file) : new TextEncoder().encode(f7.content);
          const getUrl = await client.files.getUploadURLExternal({
            token: params.token,
            filename: f7.filename,
            length: body.length,
            snippet_type: f7.snippet_type
          });
          const { upload_url, file_id } = getUrl;
          let response;
          try {
            response = await fetch(upload_url, { method: "POST", body });
          } catch (e3) {
            throw new errors_1.SlackAPIConnectionError("files.slack.com", -1, "", void 0, e3);
          }
          const uploadBody = await response.text();
          if ((0, index_1.isDebugLogEnabled)(__classPrivateFieldGet(client, _SlackAPIClient_logLevel, "f"))) {
            console.log(`Slack file upload result: (file ID: ${file_id}, status: ${response.status}, body: ${uploadBody})`);
          }
          if (response.status !== 200) {
            uploadErrors.push(uploadBody);
          }
          if (uploadErrors.length > 0) {
            const errorResponse = {
              ok: false,
              error: "upload_failure",
              uploadErrors,
              headers: response.headers
            };
            throw new errors_1.SlackAPIError("files.slack.com", "upload_error", errorResponse);
          }
          return { id: file_id, title: f7.title ?? f7.filename };
        }
        completes.push(uploadAsync());
      }
      try {
        const completion = await this.files.completeUploadExternal({
          token: params.token,
          files: await Promise.all(completes),
          channel_id: params.channel_id,
          initial_comment: params.initial_comment,
          thread_ts: params.thread_ts
        });
        return {
          ok: true,
          files: completion.files,
          headers: completion.headers
        };
      } catch (e3) {
        if (e3 instanceof errors_1.SlackAPIError && !__classPrivateFieldGet(this, _SlackAPIClient_throwSlackAPIError, "f")) {
          return e3.result;
        }
        throw e3;
      }
    }, _SlackAPIClient_bindApiCall = function _SlackAPIClient_bindApiCall2(self2, method) {
      return self2.call.bind(self2, method);
    }, _SlackAPIClient_bindNoArgAllowedApiCall = function _SlackAPIClient_bindNoArgAllowedApiCall2(self2, method) {
      return self2.call.bind(self2, method);
    }, _SlackAPIClient_bindMultipartApiCall = function _SlackAPIClient_bindMultipartApiCall2(self2, method) {
      return __classPrivateFieldGet(self2, _SlackAPIClient_instances, "m", _SlackAPIClient_sendMultipartData).bind(self2, method);
    }, _SlackAPIClient_bindFilesUploadV2 = function _SlackAPIClient_bindFilesUploadV22(self2) {
      return __classPrivateFieldGet(self2, _SlackAPIClient_instances, "m", _SlackAPIClient_uploadFilesV2).bind(self2);
    };
  }
});

// node_modules/slack-web-api-client/dist/client/request.js
var require_request = __commonJS({
  "node_modules/slack-web-api-client/dist/client/request.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/client/response.js
var require_response2 = __commonJS({
  "node_modules/slack-web-api-client/dist/client/response.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/client/automation-response/index.js
var require_automation_response = __commonJS({
  "node_modules/slack-web-api-client/dist/client/automation-response/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/client/generated-response/index.js
var require_generated_response = __commonJS({
  "node_modules/slack-web-api-client/dist/client/generated-response/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/client/webhook-client.js
var require_webhook_client = __commonJS({
  "node_modules/slack-web-api-client/dist/client/webhook-client.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f7) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f7.call(receiver, value) : f7 ? f7.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _WebhookSender_url;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResponseUrlSender = exports.WebhookSender = void 0;
    var errors_1 = require_errors();
    var WebhookSender = class {
      constructor(url) {
        _WebhookSender_url.set(this, void 0);
        __classPrivateFieldSet(this, _WebhookSender_url, url, "f");
      }
      async call(params) {
        try {
          const response = await fetch(__classPrivateFieldGet(this, _WebhookSender_url, "f"), {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(params)
          });
          const responseBody = await response.text();
          const body = responseBody.toLowerCase();
          if (response.status != 200 || body !== "ok" && body.toLowerCase() !== '{"ok":true}') {
            throw new errors_1.WebhookError(response.status, responseBody);
          }
          return response;
        } catch (e3) {
          throw new errors_1.WebhookError(-1, "", e3);
        }
      }
    };
    exports.WebhookSender = WebhookSender;
    _WebhookSender_url = /* @__PURE__ */ new WeakMap();
    exports.ResponseUrlSender = WebhookSender;
  }
});

// node_modules/slack-web-api-client/dist/manifest/manifest-params.js
var require_manifest_params = __commonJS({
  "node_modules/slack-web-api-client/dist/manifest/manifest-params.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/manifest/events.js
var require_events = __commonJS({
  "node_modules/slack-web-api-client/dist/manifest/events.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/manifest/scopes.js
var require_scopes = __commonJS({
  "node_modules/slack-web-api-client/dist/manifest/scopes.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/token-rotation/token-refresh-targets.js
var require_token_refresh_targets = __commonJS({
  "node_modules/slack-web-api-client/dist/token-rotation/token-refresh-targets.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/token-rotation/token-refresh-results.js
var require_token_refresh_results = __commonJS({
  "node_modules/slack-web-api-client/dist/token-rotation/token-refresh-results.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/token-rotation/token-rotator-options.js
var require_token_rotator_options = __commonJS({
  "node_modules/slack-web-api-client/dist/token-rotation/token-rotator-options.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-web-api-client/dist/token-rotation/token-rotator.js
var require_token_rotator = __commonJS({
  "node_modules/slack-web-api-client/dist/token-rotation/token-rotator.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f7) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f7.call(receiver, value) : f7 ? f7.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _TokenRotator_clientId;
    var _TokenRotator_clientSecret;
    var _TokenRotator_client;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenRotator = void 0;
    var errors_1 = require_errors();
    var api_client_1 = require_api_client();
    var TokenRotator = class {
      constructor(options) {
        _TokenRotator_clientId.set(this, void 0);
        _TokenRotator_clientSecret.set(this, void 0);
        _TokenRotator_client.set(this, void 0);
        __classPrivateFieldSet(this, _TokenRotator_clientId, options.clientId, "f");
        __classPrivateFieldSet(this, _TokenRotator_clientSecret, options.clientSecret, "f");
        __classPrivateFieldSet(this, _TokenRotator_client, new api_client_1.SlackAPIClient(void 0, options), "f");
      }
      async performRotation(targets) {
        const refreshResults = {};
        const randomSeconds = Math.round(crypto.getRandomValues(new Uint16Array(1))[0] / 100);
        const expireAt = (/* @__PURE__ */ new Date()).getTime() / 1e3 + randomSeconds;
        if (targets.bot && targets.bot.token_expires_at < expireAt) {
          try {
            const response = await __classPrivateFieldGet(this, _TokenRotator_client, "f").oauth.v2.access({
              client_id: __classPrivateFieldGet(this, _TokenRotator_clientId, "f"),
              client_secret: __classPrivateFieldGet(this, _TokenRotator_clientSecret, "f"),
              grant_type: "refresh_token",
              refresh_token: targets.bot.refresh_token
            });
            if (response && response.access_token && response.refresh_token && response.expires_in) {
              refreshResults.bot = {
                access_token: response.access_token,
                refresh_token: response.refresh_token,
                token_expires_at: (/* @__PURE__ */ new Date()).getTime() / 1e3 + response.expires_in
              };
            }
          } catch (e3) {
            throw new errors_1.TokenRotationError(`Failed to refresh a bot token: ${e3}`, e3);
          }
        }
        if (targets.user && targets.user.token_expires_at < expireAt) {
          try {
            const response = await __classPrivateFieldGet(this, _TokenRotator_client, "f").oauth.v2.access({
              client_id: __classPrivateFieldGet(this, _TokenRotator_clientId, "f"),
              client_secret: __classPrivateFieldGet(this, _TokenRotator_clientSecret, "f"),
              grant_type: "refresh_token",
              refresh_token: targets.user.refresh_token
            });
            if (response && response.access_token && response.refresh_token && response.expires_in) {
              refreshResults.user = {
                access_token: response.access_token,
                refresh_token: response.refresh_token,
                token_expires_at: (/* @__PURE__ */ new Date()).getTime() / 1e3 + response.expires_in
              };
            }
          } catch (e3) {
            throw new errors_1.TokenRotationError(`Failed to refresh a user token: ${e3}`, e3);
          }
        }
        return refreshResults;
      }
    };
    exports.TokenRotator = TokenRotator;
    _TokenRotator_clientId = /* @__PURE__ */ new WeakMap(), _TokenRotator_clientSecret = /* @__PURE__ */ new WeakMap(), _TokenRotator_client = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/slack-web-api-client/dist/index.js
var require_dist = __commonJS({
  "node_modules/slack-web-api-client/dist/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      var desc = Object.getOwnPropertyDescriptor(m4, k5);
      if (!desc || ("get" in desc ? !m4.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m4[k5];
        } };
      }
      Object.defineProperty(o5, k22, desc);
    } : function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      o5[k22] = m4[k5];
    });
    var __exportStar = exports && exports.__exportStar || function(m4, exports2) {
      for (var p8 in m4)
        if (p8 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p8))
          __createBinding(exports2, m4, p8);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_block_elements(), exports);
    __exportStar(require_blocks(), exports);
    __exportStar(require_confirm(), exports);
    __exportStar(require_link_unfurls(), exports);
    __exportStar(require_message_attachment(), exports);
    __exportStar(require_message_metadata(), exports);
    __exportStar(require_options(), exports);
    __exportStar(require_text_fields(), exports);
    __exportStar(require_rich_text_block(), exports);
    __exportStar(require_views(), exports);
    __exportStar(require_api_client_options(), exports);
    __exportStar(require_api_client(), exports);
    __exportStar(require_request(), exports);
    __exportStar(require_response2(), exports);
    __exportStar(require_retry_handler2(), exports);
    __exportStar(require_automation_response(), exports);
    __exportStar(require_generated_response(), exports);
    __exportStar(require_webhook_client(), exports);
    __exportStar(require_errors(), exports);
    __exportStar(require_logging(), exports);
    __exportStar(require_manifest_params(), exports);
    __exportStar(require_events(), exports);
    __exportStar(require_scopes(), exports);
    __exportStar(require_token_refresh_targets(), exports);
    __exportStar(require_token_refresh_results(), exports);
    __exportStar(require_token_rotator_options(), exports);
    __exportStar(require_token_rotator(), exports);
  }
});

// node_modules/slack-edge/dist/context/context.js
var require_context = __commonJS({
  "node_modules/slack-edge/dist/context/context.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.builtBaseContext = builtBaseContext;
    exports.extractIsEnterpriseInstall = extractIsEnterpriseInstall;
    exports.extractEnterpriseId = extractEnterpriseId;
    exports.extractTeamId = extractTeamId;
    exports.extractUserId = extractUserId;
    exports.extractActorEnterpriseId = extractActorEnterpriseId;
    exports.extractActorTeamId = extractActorTeamId;
    exports.extractActorUserId = extractActorUserId;
    exports.extractResponseUrl = extractResponseUrl;
    exports.extractChannelId = extractChannelId;
    exports.extractTriggerId = extractTriggerId;
    exports.extractFunctionExecutionId = extractFunctionExecutionId;
    exports.extractFunctionBotAccessToken = extractFunctionBotAccessToken;
    function builtBaseContext(body) {
      return {
        isEnterpriseInstall: extractIsEnterpriseInstall(body),
        enterpriseId: extractEnterpriseId(body),
        teamId: extractTeamId(body),
        userId: extractUserId(body),
        actorEnterpriseId: extractActorEnterpriseId(body),
        actorTeamId: extractActorTeamId(body),
        actorUserId: extractActorUserId(body),
        botId: void 0,
        // will be set later
        botUserId: void 0,
        // will be set later
        responseUrl: extractResponseUrl(body),
        channelId: extractChannelId(body),
        triggerId: extractTriggerId(body),
        functionExecutionId: extractFunctionExecutionId(body),
        functionBotAccessToken: extractFunctionBotAccessToken(body),
        custom: {}
      };
    }
    function extractIsEnterpriseInstall(body) {
      if (body.authorizations && body.authorizations.length > 0) {
        return body.authorizations[0].is_enterprise_install;
      } else if (body.is_enterprise_install) {
        if (typeof body.is_enterprise_install === "string") {
          return body.is_enterprise_install === "true";
        }
        return body.is_enterprise_install == true;
      }
      return void 0;
    }
    function extractEnterpriseId(body) {
      if (body.enterprise) {
        if (typeof body.enterprise === "string") {
          return body.enterprise;
        } else if (typeof body.enterprise === "object" && body.enterprise.id) {
          return body.enterprise.id;
        }
      } else if (body.authorizations && body.authorizations.length > 0) {
        return extractEnterpriseId(body.authorizations[0]);
      } else if (body.enterprise_id) {
        return body.enterprise_id;
      } else if (body.team && typeof body.team === "object" && body.team.enterprise_id) {
        return body.team.enterprise_id;
      } else if (body.event) {
        return extractEnterpriseId(body.event);
      }
      return void 0;
    }
    function extractTeamId(body) {
      if (body.view && body.view.app_installed_team_id) {
        return body.view.app_installed_team_id;
      } else if (body.team) {
        if (typeof body.team === "string") {
          return body.team;
        } else if (body.team.id) {
          return body.team.id;
        }
      } else if (body.authorizations && body.authorizations.length > 0) {
        return extractTeamId(body.authorizations[0]);
      } else if (body.team_id) {
        return body.team_id;
      } else if (body.user && typeof body.user === "object") {
        return body.user.team_id;
      } else if (body.view && typeof body.view === "object") {
        return body.view.team_id;
      }
      return void 0;
    }
    function extractUserId(body) {
      if (body.user) {
        if (typeof body.user === "string") {
          return body.user;
        }
        if (typeof body.user === "object" && body.user.id) {
          return body.user.id;
        }
      } else if (body.user_id) {
        return body.user_id;
      } else if (body.event) {
        return extractUserId(body.event);
      } else if (body.message) {
        return extractUserId(body.message);
      } else if (body.previous_message) {
        return extractUserId(body.previous_message);
      }
      return void 0;
    }
    function extractActorEnterpriseId(body) {
      if (body.is_ext_shared_channel) {
        if (body.type === "event_callback") {
          const eventTeamId = body.event?.user_team || body.event?.team;
          if (eventTeamId && eventTeamId.startsWith("E")) {
            return eventTeamId;
          } else if (eventTeamId === body.team_id) {
            return body.enterprise_id;
          }
        }
      }
      return extractEnterpriseId(body);
    }
    function extractActorTeamId(body) {
      if (body.is_ext_shared_channel) {
        if (body.type === "event_callback") {
          const eventType = body.event.type;
          if (eventType === "app_mention") {
            const userTeam = body.event.user_team;
            if (!userTeam) {
              return body.event.team;
            } else if (userTeam.startsWith("T")) {
              return userTeam;
            }
            return void 0;
          }
          const eventUserTeam = body.event.user_team;
          if (eventUserTeam) {
            if (eventUserTeam.startsWith("T")) {
              return eventUserTeam;
            } else if (eventUserTeam.startsWith("E")) {
              if (eventUserTeam === body.enterprise_id) {
                return body.team_id;
              } else if (eventUserTeam === body.context_enterprise_id) {
                return body.context_team_id;
              }
            }
          }
          const eventTeam = body.event.team;
          if (eventTeam) {
            if (eventTeam.startsWith("T")) {
              return eventTeam;
            } else if (eventTeam.startsWith("E")) {
              if (eventTeam === body.enterprise_id) {
                return body.team_id;
              } else if (eventTeam === body.context_enterprise_id) {
                return body.context_team_id;
              }
            }
          }
        }
      }
      return extractTeamId(body);
    }
    function extractActorUserId(body) {
      if (body.is_ext_shared_channel) {
        if (body.type === "event_callback") {
          if (body.event) {
            if (extractActorEnterpriseId(body) && extractActorTeamId(body)) {
              return void 0;
            }
            return body.event.user || body.event.user_id;
          } else {
            return void 0;
          }
        }
      }
      return extractUserId(body);
    }
    function extractResponseUrl(body) {
      if (body.response_url) {
        return body.response_url;
      } else if (body.response_urls && body.response_urls.length > 0) {
        return body.response_urls[0].response_url;
      }
      return void 0;
    }
    function extractChannelId(body) {
      if (body.channel) {
        if (typeof body.channel === "string") {
          return body.channel;
        } else if (typeof body.channel === "object" && body.channel.id) {
          return body.channel.id;
        }
      } else if (body.channel_id) {
        return body.channel_id;
      } else if (body.event) {
        return extractChannelId(body.event);
      } else if (body.item) {
        return extractChannelId(body.item);
      }
      return void 0;
    }
    function extractTriggerId(body) {
      if (body.trigger_id) {
        return body.trigger_id;
      }
      if (body.interactivity) {
        return body.interactivity.interactivity_pointer;
      }
      return void 0;
    }
    function extractFunctionExecutionId(body) {
      if (body.event) {
        return extractFunctionExecutionId(body.event);
      }
      if (body.function_execution_id) {
        return body.function_execution_id;
      }
      if (body.function_data) {
        return body.function_data.execution_id;
      }
      return void 0;
    }
    function extractFunctionBotAccessToken(body) {
      if (body.event) {
        return extractFunctionBotAccessToken(body.event);
      }
      if (body.bot_access_token) {
        return body.bot_access_token;
      }
      return void 0;
    }
  }
});

// node_modules/slack-edge/dist/middleware/built-in-middleware.js
var require_built_in_middleware = __commonJS({
  "node_modules/slack-edge/dist/middleware/built-in-middleware.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ignoringSelfEvents = exports.urlVerification = void 0;
    var urlVerification = async (req) => {
      if (req.body.type === "url_verification") {
        return { status: 200, body: req.body.challenge };
      }
    };
    exports.urlVerification = urlVerification;
    var eventTypesToKeep = ["member_joined_channel", "member_left_channel"];
    var ignoringSelfEvents = async (req) => {
      if (req.body.event) {
        if (eventTypesToKeep.includes(req.body.event.type)) {
          return;
        }
        if (req.context.authorizeResult.botId === req.body.event.bot_id || req.context.authorizeResult.botUserId === req.context.userId) {
          return { status: 200, body: "" };
        }
      }
    };
    exports.ignoringSelfEvents = ignoringSelfEvents;
  }
});

// node_modules/slack-edge/dist/errors.js
var require_errors2 = __commonJS({
  "node_modules/slack-edge/dist/errors.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SocketModeError = exports.AuthorizeError = exports.ConfigError = void 0;
    var ConfigError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "ConfigError";
      }
    };
    exports.ConfigError = ConfigError;
    var AuthorizeError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "AuthorizeError";
      }
    };
    exports.AuthorizeError = AuthorizeError;
    var SocketModeError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "SocketModeError";
      }
    };
    exports.SocketModeError = SocketModeError;
  }
});

// node_modules/slack-edge/dist/authorization/single-team-authorize.js
var require_single_team_authorize = __commonJS({
  "node_modules/slack-edge/dist/authorization/single-team-authorize.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.singleTeamAuthorize = void 0;
    var errors_1 = require_errors2();
    var slack_web_api_client_1 = require_dist();
    var singleTeamAuthorize = async (req) => {
      const botToken = req.env.SLACK_BOT_TOKEN;
      const client = new slack_web_api_client_1.SlackAPIClient(botToken);
      try {
        const response = await client.auth.test();
        const scopes = response.headers.get("x-oauth-scopes") ?? "";
        return {
          botToken,
          enterpriseId: response.enterprise_id,
          teamId: response.team_id,
          team: response.team,
          url: response.url,
          botId: response.bot_id,
          botUserId: response.user_id,
          userId: response.user_id,
          user: response.user,
          botScopes: scopes.split(","),
          userToken: void 0,
          // As mentioned above, user tokens are not supported in this module
          userScopes: void 0
          // As mentioned above, user tokens are not supported in this module
        };
      } catch (e3) {
        throw new errors_1.AuthorizeError(`Failed to call auth.test API due to ${e3.message}`);
      }
    };
    exports.singleTeamAuthorize = singleTeamAuthorize;
  }
});

// node_modules/slack-edge/dist/execution-context.js
var require_execution_context = __commonJS({
  "node_modules/slack-edge/dist/execution-context.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoopExecutionContext = void 0;
    var NoopExecutionContext = class {
      // deno-lint-ignore no-explicit-any
      waitUntil(promise) {
        promise.catch((reason) => {
          console.error(`Failed to run a lazy listener: ${reason}`);
        });
      }
    };
    exports.NoopExecutionContext = NoopExecutionContext;
  }
});

// node_modules/slack-edge/dist/request/payload-types.js
var require_payload_types = __commonJS({
  "node_modules/slack-edge/dist/request/payload-types.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PayloadType = void 0;
    var PayloadType;
    (function(PayloadType2) {
      PayloadType2["BlockAction"] = "block_actions";
      PayloadType2["BlockSuggestion"] = "block_suggestion";
      PayloadType2["MessageShortcut"] = "message_action";
      PayloadType2["GlobalShortcut"] = "shortcut";
      PayloadType2["EventsAPI"] = "event_callback";
      PayloadType2["ViewSubmission"] = "view_submission";
      PayloadType2["ViewClosed"] = "view_closed";
    })(PayloadType || (exports.PayloadType = PayloadType = {}));
  }
});

// node_modules/slack-edge/dist/utility/message-events.js
var require_message_events = __commonJS({
  "node_modules/slack-edge/dist/utility/message-events.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPostedMessageEvent = void 0;
    var isPostedMessageEvent = (event) => {
      return event.subtype === void 0 || event.subtype === "bot_message" || event.subtype === "file_share" || event.subtype === "thread_broadcast";
    };
    exports.isPostedMessageEvent = isPostedMessageEvent;
  }
});

// node_modules/slack-edge/dist/socket-mode/payload-handler.js
var require_payload_handler = __commonJS({
  "node_modules/slack-edge/dist/socket-mode/payload-handler.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fromSocketModeToRequest = fromSocketModeToRequest;
    exports.fromResponseToSocketModePayload = fromResponseToSocketModePayload;
    function fromSocketModeToRequest({ url, body, retryNum, retryReason }) {
      if (!body) {
        return void 0;
      }
      const payload = JSON.stringify(body);
      const headers = {
        "content-type": "application/json"
      };
      if (retryNum) {
        headers["x-slack-retry-num"] = retryNum;
      }
      if (retryReason) {
        headers["x-slack-retry-reason"] = retryReason;
      }
      const options = {
        method: "POST",
        headers: new Headers(headers),
        body: new Blob([payload]).stream(),
        duplex: "half"
        // required when running on Node.js runtime
      };
      return new Request(url ?? "wss://localhost", options);
    }
    async function fromResponseToSocketModePayload({ response }) {
      let message = {};
      if (response.body) {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.startsWith("text/plain")) {
          const text = await response.text();
          if (text) {
            message = { text };
          }
        } else {
          message = await response.json();
        }
      }
      return message;
    }
  }
});

// node_modules/slack-edge/dist/socket-mode/socket-mode-client.js
var require_socket_mode_client = __commonJS({
  "node_modules/slack-edge/dist/socket-mode/socket-mode-client.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SocketModeClient = void 0;
    var slack_web_api_client_1 = require_dist();
    var errors_1 = require_errors2();
    var payload_handler_1 = require_payload_handler();
    var SocketModeClient = class {
      constructor(app) {
        if (!app.socketMode) {
          throw new errors_1.ConfigError("socketMode: true must be set for running with Socket Mode");
        }
        if (!app.appLevelToken) {
          throw new errors_1.ConfigError("appLevelToken must be set for running with Socket Mode");
        }
        this.app = app;
        this.appLevelToken = app.appLevelToken;
        console.warn("WARNING: The Socket Mode support provided by slack-edge is still experimental and is not designed to handle reconnections for production-grade applications. It is recommended to use this mode only for local development and testing purposes.");
      }
      async connect() {
        const client = new slack_web_api_client_1.SlackAPIClient(this.appLevelToken);
        try {
          const newConnection = await client.apps.connections.open();
          this.ws = new WebSocket(newConnection.url);
        } catch (e3) {
          throw new errors_1.SocketModeError(`Failed to establish a new WSS connection: ${e3}`);
        }
        if (this.ws) {
          const ws = this.ws;
          ws.onopen = async (ev) => {
            if ((0, slack_web_api_client_1.isDebugLogEnabled)(app.env.SLACK_LOGGING_LEVEL)) {
              console.log(`Now the Socket Mode client is connected to Slack: ${JSON.stringify(ev)}`);
            }
          };
          ws.onclose = async (ev) => {
            if ((0, slack_web_api_client_1.isDebugLogEnabled)(app.env.SLACK_LOGGING_LEVEL)) {
              console.log(`The Socket Mode client is disconnected from Slack: ${JSON.stringify(ev)}`);
            }
          };
          ws.onerror = async (e3) => {
            console.error(`An error was thrown by the Socket Mode connection: ${e3}`);
          };
          const app = this.app;
          ws.onmessage = async (ev) => {
            try {
              if (ev.data && typeof ev.data === "string" && ev.data.startsWith("{")) {
                const data = JSON.parse(ev.data);
                if (data.type === "hello") {
                  if ((0, slack_web_api_client_1.isDebugLogEnabled)(app.env.SLACK_LOGGING_LEVEL)) {
                    console.log(`*** Received hello data ***
 ${ev.data}`);
                  }
                  return;
                }
                const request = (0, payload_handler_1.fromSocketModeToRequest)({
                  url: ws.url,
                  body: data.payload,
                  retryNum: data.retry_attempt,
                  retryReason: data.retry_reason
                });
                if (!request) {
                  return;
                }
                const response = await app.run(request);
                const message = {
                  envelope_id: data.envelope_id
                };
                const payload = await (0, payload_handler_1.fromResponseToSocketModePayload)({ response });
                if (payload) {
                  message.payload = payload;
                }
                ws.send(JSON.stringify(message));
              } else {
                if ((0, slack_web_api_client_1.isDebugLogEnabled)(app.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Received non-JSON data ***
 ${ev.data}`);
                }
              }
            } catch (e3) {
              console.error(`Failed to handle a WebSocke message: ${e3}`);
            }
          };
        }
      }
      // deno-lint-ignore require-await
      async disconnect() {
        if (this.ws) {
          this.ws.close();
          this.ws = void 0;
        }
      }
    };
    exports.SocketModeClient = SocketModeClient;
  }
});

// node_modules/slack-edge/dist/utility/function-executed-event.js
var require_function_executed_event = __commonJS({
  "node_modules/slack-edge/dist/utility/function-executed-event.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isFunctionExecutedEvent = void 0;
    var isFunctionExecutedEvent = (event) => {
      return event.type === "function_executed";
    };
    exports.isFunctionExecutedEvent = isFunctionExecutedEvent;
  }
});

// node_modules/slack-edge/dist/app.js
var require_app = __commonJS({
  "node_modules/slack-edge/dist/app.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _SlackApp_instances;
    var _SlackApp_slashCommands;
    var _SlackApp_events;
    var _SlackApp_globalShorcuts;
    var _SlackApp_messageShorcuts;
    var _SlackApp_blockActions;
    var _SlackApp_blockSuggestions;
    var _SlackApp_viewSubmissions;
    var _SlackApp_viewClosed;
    var _SlackApp_callAuthorize;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.noopLazyHandler = exports.SlackApp = void 0;
    var request_parser_1 = require_request_parser();
    var request_verification_1 = require_request_verification();
    var response_1 = require_response();
    var slack_web_api_client_1 = require_dist();
    var context_1 = require_context();
    var slack_web_api_client_2 = require_dist();
    var built_in_middleware_1 = require_built_in_middleware();
    var errors_1 = require_errors2();
    var single_team_authorize_1 = require_single_team_authorize();
    var execution_context_1 = require_execution_context();
    var payload_types_1 = require_payload_types();
    var message_events_1 = require_message_events();
    var socket_mode_client_1 = require_socket_mode_client();
    var function_executed_event_1 = require_function_executed_event();
    var SlackApp = class {
      // --------------------------
      constructor(options) {
        _SlackApp_instances.add(this);
        this.preAuthorizeMiddleware = [built_in_middleware_1.urlVerification];
        this.postAuthorizeMiddleware = [built_in_middleware_1.ignoringSelfEvents];
        this.eventsToSkipAuthorize = ["app_uninstalled", "tokens_revoked"];
        _SlackApp_slashCommands.set(this, []);
        _SlackApp_events.set(this, []);
        _SlackApp_globalShorcuts.set(this, []);
        _SlackApp_messageShorcuts.set(this, []);
        _SlackApp_blockActions.set(this, []);
        _SlackApp_blockSuggestions.set(this, []);
        _SlackApp_viewSubmissions.set(this, []);
        _SlackApp_viewClosed.set(this, []);
        if (options.env.SLACK_BOT_TOKEN === void 0 && (options.authorize === void 0 || options.authorize === single_team_authorize_1.singleTeamAuthorize)) {
          throw new errors_1.ConfigError("When you don't pass env.SLACK_BOT_TOKEN, your own authorize function, which supplies a valid token to use, needs to be passed instead.");
        }
        this.env = options.env;
        this.client = new slack_web_api_client_1.SlackAPIClient(options.env.SLACK_BOT_TOKEN, {
          logLevel: this.env.SLACK_LOGGING_LEVEL
        });
        this.appLevelToken = options.env.SLACK_APP_TOKEN;
        this.socketMode = options.socketMode ?? this.appLevelToken !== void 0;
        if (this.socketMode) {
          this.signingSecret = "";
        } else {
          if (!this.env.SLACK_SIGNING_SECRET) {
            throw new errors_1.ConfigError("env.SLACK_SIGNING_SECRET is required to run your app on edge functions!");
          }
          this.signingSecret = this.env.SLACK_SIGNING_SECRET;
        }
        this.startLazyListenerAfterAck = options.startLazyListenerAfterAck ?? false;
        this.authorize = options.authorize ?? single_team_authorize_1.singleTeamAuthorize;
        this.routes = { events: options.routes?.events };
      }
      /**
       * Registers a pre-authorize middleware.
       * @param middleware middleware
       * @returns this instance
       */
      beforeAuthorize(middleware) {
        this.preAuthorizeMiddleware.push(middleware);
        return this;
      }
      /**
       * Registers a post-authorize middleware. This naming is for consistency with bolt-js.
       * @param middleware middleware
       * @returns this instance
       */
      middleware(middleware) {
        return this.afterAuthorize(middleware);
      }
      /**
       * Registers a post-authorize middleware. This naming is for consistency with bolt-js.
       * @param middleware middleware
       * @returns this instance
       */
      use(middleware) {
        return this.afterAuthorize(middleware);
      }
      /**
       * Registers a post-authorize middleware.
       * @param middleware middleware
       * @returns this instance
       */
      afterAuthorize(middleware) {
        this.postAuthorizeMiddleware.push(middleware);
        return this;
      }
      /**
       * Registers a listener that handles slash command executions.
       * @param pattern the pattern to match slash command name
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      command(pattern, ack, lazy = exports.noopLazyHandler) {
        const handler = { ack, lazy };
        __classPrivateFieldGet(this, _SlackApp_slashCommands, "f").push((body) => {
          if (body.type || !body.command) {
            return null;
          }
          if (typeof pattern === "string" && body.command === pattern) {
            return handler;
          } else if (typeof pattern === "object" && pattern instanceof RegExp && body.command.match(pattern)) {
            return handler;
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles custom function calls within Workflow Builder.
       * Please be aware that this feature is still in beta as of April 2024.
       * @param callbackId the pattern to match callback_id in a payload
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      function(callbackId, lazy) {
        __classPrivateFieldGet(this, _SlackApp_events, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.EventsAPI || !body.event || body.event.type !== "function_executed") {
            return null;
          }
          if ((0, function_executed_event_1.isFunctionExecutedEvent)(body.event)) {
            let matched = true;
            if (callbackId !== void 0) {
              if (typeof callbackId === "string") {
                matched = body.event.function.callback_id.includes(callbackId);
              }
              if (typeof callbackId === "object") {
                matched = body.event.function.callback_id.match(callbackId) !== null;
              }
            }
            if (matched) {
              return { ack: async (_4) => "", lazy };
            }
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles Events API request.
       * @param event the pattern to match event type in a payload
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      event(event, lazy) {
        __classPrivateFieldGet(this, _SlackApp_events, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.EventsAPI || !body.event) {
            return null;
          }
          if (body.event.type === event) {
            return { ack: async () => "", lazy };
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles all newly posted message events.
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      anyMessage(lazy) {
        return this.message(void 0, lazy);
      }
      /**
       * Registers a listener that handles newly posted message events that matches the pattern.
       * @param pattern the pattern to match a message event's text
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      message(pattern, lazy) {
        __classPrivateFieldGet(this, _SlackApp_events, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.EventsAPI || !body.event || body.event.type !== "message") {
            return null;
          }
          if ((0, message_events_1.isPostedMessageEvent)(body.event)) {
            let matched = true;
            if (pattern !== void 0) {
              if (typeof pattern === "string") {
                matched = body.event.text.includes(pattern);
              }
              if (typeof pattern === "object") {
                matched = body.event.text.match(pattern) !== null;
              }
            }
            if (matched) {
              return { ack: async (_4) => "", lazy };
            }
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles global/message shortcut executions.
       * @param callbackId the pattern to match callback_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      shortcut(callbackId, ack, lazy = exports.noopLazyHandler) {
        return this.globalShortcut(callbackId, ack, lazy).messageShortcut(callbackId, ack, lazy);
      }
      /**
       * Registers a listener that handles global shortcut executions.
       * @param callbackId the pattern to match callback_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      globalShortcut(callbackId, ack, lazy = exports.noopLazyHandler) {
        const handler = { ack, lazy };
        __classPrivateFieldGet(this, _SlackApp_globalShorcuts, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.GlobalShortcut || !body.callback_id) {
            return null;
          }
          if (typeof callbackId === "string" && body.callback_id === callbackId) {
            return handler;
          } else if (typeof callbackId === "object" && callbackId instanceof RegExp && body.callback_id.match(callbackId)) {
            return handler;
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles message shortcut executions.
       * @param callbackId the pattern to match callback_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      messageShortcut(callbackId, ack, lazy = exports.noopLazyHandler) {
        const handler = { ack, lazy };
        __classPrivateFieldGet(this, _SlackApp_messageShorcuts, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.MessageShortcut || !body.callback_id) {
            return null;
          }
          if (typeof callbackId === "string" && body.callback_id === callbackId) {
            return handler;
          } else if (typeof callbackId === "object" && callbackId instanceof RegExp && body.callback_id.match(callbackId)) {
            return handler;
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles type: "block_actions" requests.
       * @param constraints the constraints to match block_id/action_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      action(constraints, ack, lazy = exports.noopLazyHandler) {
        const handler = { ack, lazy };
        __classPrivateFieldGet(this, _SlackApp_blockActions, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.BlockAction || !body.actions || !body.actions[0]) {
            return null;
          }
          const action = body.actions[0];
          if (typeof constraints === "string" && action.action_id === constraints) {
            return handler;
          } else if (typeof constraints === "object") {
            if (constraints instanceof RegExp) {
              if (action.action_id.match(constraints)) {
                return handler;
              }
            } else if (constraints.type) {
              if (action.type === constraints.type) {
                if (action.action_id === constraints.action_id) {
                  if (constraints.block_id && action.block_id !== constraints.block_id) {
                    return null;
                  }
                  return handler;
                }
              }
            }
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles type: "block_suggestion" requests.
       * Note that your app must return the options/option_groups within 3 seconds,
       * so slack-edge intentionally does not accept lazy here.
       * @param constraints the constraints to match block_id/action_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @returns this instance
       */
      options(constraints, ack) {
        const handler = { ack };
        __classPrivateFieldGet(this, _SlackApp_blockSuggestions, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.BlockSuggestion || !body.action_id) {
            return null;
          }
          if (typeof constraints === "string" && body.action_id === constraints) {
            return handler;
          } else if (typeof constraints === "object") {
            if (constraints instanceof RegExp) {
              if (body.action_id.match(constraints)) {
                return handler;
              }
            } else {
              if (body.action_id === constraints.action_id) {
                if (body.block_id && body.block_id !== constraints.block_id) {
                  return null;
                }
                return handler;
              }
            }
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles type: "view_submission"/"view_closed" requests.
       * @param callbackId the constraints to match callback_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      view(callbackId, ack, lazy = exports.noopLazyHandler) {
        return this.viewSubmission(callbackId, ack, lazy).viewClosed(callbackId, ack, lazy);
      }
      /**
       * Registers a listener that handles type: "view_submission" requests.
       * @param callbackId the constraints to match callback_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      viewSubmission(callbackId, ack, lazy = exports.noopLazyHandler) {
        const handler = { ack, lazy };
        __classPrivateFieldGet(this, _SlackApp_viewSubmissions, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.ViewSubmission || !body.view) {
            return null;
          }
          if (typeof callbackId === "string" && body.view.callback_id === callbackId) {
            return handler;
          } else if (typeof callbackId === "object" && callbackId instanceof RegExp && body.view.callback_id.match(callbackId)) {
            return handler;
          }
          return null;
        });
        return this;
      }
      /**
       * Registers a listener that handles type: "view_closed" requests.
       * @param callbackId the constraints to match callback_id in a payload
       * @param ack ack function that must complete within 3 seconds
       * @param lazy lazy function that can do anything asynchronously
       * @returns this instance
       */
      viewClosed(callbackId, ack, lazy = exports.noopLazyHandler) {
        const handler = { ack, lazy };
        __classPrivateFieldGet(this, _SlackApp_viewClosed, "f").push((body) => {
          if (body.type !== payload_types_1.PayloadType.ViewClosed || !body.view) {
            return null;
          }
          if (typeof callbackId === "string" && body.view.callback_id === callbackId) {
            return handler;
          } else if (typeof callbackId === "object" && callbackId instanceof RegExp && body.view.callback_id.match(callbackId)) {
            return handler;
          }
          return null;
        });
        return this;
      }
      /**
       * Handles an http request and returns a response to it.
       * @param request request
       * @param ctx execution context
       * @returns response
       */
      async run(request, ctx = new execution_context_1.NoopExecutionContext()) {
        return await this.handleEventRequest(request, ctx);
      }
      /**
       * Establishes a WebSocket connection for Socket Mode.
       */
      async connect() {
        if (!this.socketMode) {
          throw new errors_1.ConfigError("Both env.SLACK_APP_TOKEN and socketMode: true are required to start a Socket Mode connection!");
        }
        this.socketModeClient = new socket_mode_client_1.SocketModeClient(this);
        await this.socketModeClient.connect();
      }
      /**
       * Disconnect a WebSocket connection for Socket Mode.
       */
      async disconnect() {
        if (this.socketModeClient) {
          await this.socketModeClient.disconnect();
        }
      }
      /**
       * Handles an HTTP request from Slack's API server and returns a response to it.
       * @param request request
       * @param ctx execution context
       * @returns response
       */
      async handleEventRequest(request, ctx) {
        if (this.routes.events) {
          const { pathname } = new URL(request.url);
          if (pathname !== this.routes.events) {
            return new Response("Not found", { status: 404 });
          }
        }
        const blobRequestBody = await request.blob();
        const rawBody = await blobRequestBody.text();
        if (rawBody.includes("ssl_check=")) {
          const bodyParams = new URLSearchParams(rawBody);
          if (bodyParams.get("ssl_check") === "1" && bodyParams.get("token")) {
            return new Response("", { status: 200 });
          }
        }
        const isRequestSignatureVerified = this.socketMode || await (0, request_verification_1.verifySlackRequest)(this.signingSecret, request.headers, rawBody);
        if (isRequestSignatureVerified) {
          const body = await (0, request_parser_1.parseRequestBody)(request.headers, rawBody);
          let retryNum = void 0;
          try {
            const retryNumHeader = request.headers.get("x-slack-retry-num");
            if (retryNumHeader) {
              retryNum = Number.parseInt(retryNumHeader);
            } else if (this.socketMode && body.retry_attempt) {
              retryNum = Number.parseInt(body.retry_attempt);
            }
          } catch (e3) {
          }
          const retryReason = request.headers.get("x-slack-retry-reason") ?? body.retry_reason;
          const preAuthorizeRequest = {
            body,
            rawBody,
            retryNum,
            retryReason,
            context: (0, context_1.builtBaseContext)(body),
            env: this.env,
            headers: request.headers
          };
          if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
            console.log(`*** Received request body ***
 ${(0, slack_web_api_client_2.prettyPrint)(body)}`);
          }
          for (const middlware of this.preAuthorizeMiddleware) {
            const response = await middlware(preAuthorizeRequest);
            if (response) {
              return (0, response_1.toCompleteResponse)(response);
            }
          }
          const authorizeResult = await __classPrivateFieldGet(this, _SlackApp_instances, "m", _SlackApp_callAuthorize).call(this, preAuthorizeRequest);
          const primaryToken = preAuthorizeRequest.context.functionBotAccessToken || authorizeResult.botToken;
          const authorizedContext = {
            ...preAuthorizeRequest.context,
            authorizeResult,
            client: new slack_web_api_client_1.SlackAPIClient(primaryToken, {
              logLevel: this.env.SLACK_LOGGING_LEVEL
            }),
            botToken: authorizeResult.botToken,
            botId: authorizeResult.botId,
            botUserId: authorizeResult.botUserId,
            userToken: authorizeResult.userToken
          };
          if (authorizedContext.channelId) {
            const context = authorizedContext;
            const primaryToken2 = context.functionBotAccessToken || context.botToken;
            const client = new slack_web_api_client_1.SlackAPIClient(primaryToken2);
            context.say = async (params) => await client.chat.postMessage({
              channel: context.channelId,
              ...params
            });
          }
          if (authorizedContext.responseUrl) {
            const responseUrl = authorizedContext.responseUrl;
            authorizedContext.respond = async (params) => {
              return new slack_web_api_client_1.ResponseUrlSender(responseUrl).call(params);
            };
          }
          const baseRequest = {
            ...preAuthorizeRequest,
            context: authorizedContext
          };
          for (const middlware of this.postAuthorizeMiddleware) {
            const response = await middlware(baseRequest);
            if (response) {
              return (0, response_1.toCompleteResponse)(response);
            }
          }
          const payload = body;
          if (body.type === payload_types_1.PayloadType.EventsAPI) {
            const slackRequest = {
              payload: body.event,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_events, "f")) {
              const handler = matcher(payload);
              if (handler) {
                if (!this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                if (this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          } else if (!body.type && body.command) {
            const slackRequest = {
              payload: body,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_slashCommands, "f")) {
              const handler = matcher(payload);
              if (handler) {
                if (!this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                if (this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          } else if (body.type === payload_types_1.PayloadType.GlobalShortcut) {
            const slackRequest = {
              payload: body,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_globalShorcuts, "f")) {
              const handler = matcher(payload);
              if (handler) {
                if (!this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                if (this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          } else if (body.type === payload_types_1.PayloadType.MessageShortcut) {
            const slackRequest = {
              payload: body,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_messageShorcuts, "f")) {
              const handler = matcher(payload);
              if (handler) {
                if (!this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                if (this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          } else if (body.type === payload_types_1.PayloadType.BlockAction) {
            const slackRequest = {
              // deno-lint-ignore no-explicit-any
              payload: body,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_blockActions, "f")) {
              const handler = matcher(payload);
              if (handler) {
                if (!this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                if (this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          } else if (body.type === payload_types_1.PayloadType.BlockSuggestion) {
            const slackRequest = {
              payload: body,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_blockSuggestions, "f")) {
              const handler = matcher(payload);
              if (handler) {
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          } else if (body.type === payload_types_1.PayloadType.ViewSubmission) {
            const slackRequest = {
              payload: body,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_viewSubmissions, "f")) {
              const handler = matcher(payload);
              if (handler) {
                if (!this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                if (this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          } else if (body.type === payload_types_1.PayloadType.ViewClosed) {
            const slackRequest = {
              payload: body,
              ...baseRequest
            };
            for (const matcher of __classPrivateFieldGet(this, _SlackApp_viewClosed, "f")) {
              const handler = matcher(payload);
              if (handler) {
                if (!this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                const slackResponse = await handler.ack(slackRequest);
                if ((0, slack_web_api_client_2.isDebugLogEnabled)(this.env.SLACK_LOGGING_LEVEL)) {
                  console.log(`*** Slack response ***
${(0, slack_web_api_client_2.prettyPrint)(slackResponse)}`);
                }
                if (this.startLazyListenerAfterAck) {
                  ctx.waitUntil(handler.lazy(slackRequest));
                }
                return (0, response_1.toCompleteResponse)(slackResponse);
              }
            }
          }
          console.log(`*** No listener found ***
${JSON.stringify(baseRequest.body)}`);
          return new Response("No listener found", { status: 404 });
        }
        return new Response("Invalid signature", { status: 401 });
      }
    };
    exports.SlackApp = SlackApp;
    _SlackApp_slashCommands = /* @__PURE__ */ new WeakMap(), _SlackApp_events = /* @__PURE__ */ new WeakMap(), _SlackApp_globalShorcuts = /* @__PURE__ */ new WeakMap(), _SlackApp_messageShorcuts = /* @__PURE__ */ new WeakMap(), _SlackApp_blockActions = /* @__PURE__ */ new WeakMap(), _SlackApp_blockSuggestions = /* @__PURE__ */ new WeakMap(), _SlackApp_viewSubmissions = /* @__PURE__ */ new WeakMap(), _SlackApp_viewClosed = /* @__PURE__ */ new WeakMap(), _SlackApp_instances = /* @__PURE__ */ new WeakSet(), _SlackApp_callAuthorize = async function _SlackApp_callAuthorize2(request) {
      const body = request.body;
      if (body.type === payload_types_1.PayloadType.EventsAPI && body.event && this.eventsToSkipAuthorize.includes(body.event.type)) {
        return {
          enterpriseId: request.context.actorEnterpriseId,
          teamId: request.context.actorTeamId,
          team: request.context.actorTeamId,
          botId: request.context.botId || "N/A",
          botUserId: request.context.botUserId || "N/A",
          botToken: "N/A",
          botScopes: [],
          userId: request.context.actorUserId,
          user: request.context.actorUserId,
          userToken: "N/A",
          userScopes: []
        };
      }
      return await this.authorize(request);
    };
    var noopLazyHandler = async () => {
    };
    exports.noopLazyHandler = noopLazyHandler;
  }
});

// node_modules/slack-edge/dist/app-env.js
var require_app_env = __commonJS({
  "node_modules/slack-edge/dist/app-env.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/oauth/error-codes.js
var require_error_codes = __commonJS({
  "node_modules/slack-edge/dist/oauth/error-codes.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenIDConnectError = exports.CompletionPageError = exports.InstallationStoreError = exports.InstallationError = exports.MissingCode = exports.InvalidStateParameter = void 0;
    exports.InvalidStateParameter = {
      code: "invalid-state",
      message: "The state parameter is missing or invalid"
    };
    exports.MissingCode = {
      code: "missing-code",
      message: "The code parameter is missing"
    };
    exports.InstallationError = {
      code: "installation-error",
      message: "The installation process failed"
    };
    exports.InstallationStoreError = {
      code: "installation-store-error",
      message: "Saving the installation data failed"
    };
    exports.CompletionPageError = {
      code: "completion-page-failure",
      message: "Rendering the completion page failed"
    };
    exports.OpenIDConnectError = {
      code: "oidc-error",
      message: "The OpenID Connect process failed"
    };
  }
});

// node_modules/slack-edge/dist/handler/handler.js
var require_handler = __commonJS({
  "node_modules/slack-edge/dist/handler/handler.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/handler/message-handler.js
var require_message_handler = __commonJS({
  "node_modules/slack-edge/dist/handler/message-handler.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/handler/options-handler.js
var require_options_handler = __commonJS({
  "node_modules/slack-edge/dist/handler/options-handler.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/handler/view-handler.js
var require_view_handler = __commonJS({
  "node_modules/slack-edge/dist/handler/view-handler.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/authorization/authorize.js
var require_authorize = __commonJS({
  "node_modules/slack-edge/dist/authorization/authorize.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/authorization/authorize-result.js
var require_authorize_result = __commonJS({
  "node_modules/slack-edge/dist/authorization/authorize-result.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/middleware/middleware.js
var require_middleware = __commonJS({
  "node_modules/slack-edge/dist/middleware/middleware.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/oauth/state-store.js
var require_state_store = __commonJS({
  "node_modules/slack-edge/dist/oauth/state-store.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoStorageStateStore = void 0;
    var NoStorageStateStore = class {
      // deno-lint-ignore require-await
      async issueNewState() {
        return crypto.randomUUID();
      }
      // deno-lint-ignore require-await no-unused-vars
      async consume(state) {
        return true;
      }
    };
    exports.NoStorageStateStore = NoStorageStateStore;
  }
});

// node_modules/slack-edge/dist/oauth/authorize-url-generator.js
var require_authorize_url_generator = __commonJS({
  "node_modules/slack-edge/dist/oauth/authorize-url-generator.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateAuthorizeUrl = generateAuthorizeUrl;
    function generateAuthorizeUrl(state, env, team = void 0) {
      let url = `https://slack.com/oauth/v2/authorize?state=${state}`;
      url += `&client_id=${env.SLACK_CLIENT_ID}`;
      url += `&scope=${env.SLACK_BOT_SCOPES}`;
      if (env.SLACK_USER_SCOPES) {
        url += `&user_scope=${env.SLACK_USER_SCOPES}`;
      }
      if (env.SLACK_REDIRECT_URI) {
        url += `&redirect_uri=${env.SLACK_REDIRECT_URI}`;
      }
      if (team) {
        url += `&team=${team}`;
      }
      return url;
    }
  }
});

// node_modules/slack-edge/dist/cookie.js
var require_cookie = __commonJS({
  "node_modules/slack-edge/dist/cookie.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = parse2;
    function parse2(str, options = void 0) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      const obj = {};
      const opt = options || {};
      const dec = opt.decode || decode;
      let index = 0;
      while (index < str.length) {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) {
          break;
        }
        let endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = str.length;
        } else if (endIdx < eqIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = str.slice(index, eqIdx).trim();
        if (void 0 === obj[key]) {
          let val = str.slice(eqIdx + 1, endIdx).trim();
          if (val.charCodeAt(0) === 34) {
            val = val.slice(1, -1);
          }
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      }
      return obj;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e3) {
        return str;
      }
    }
  }
});

// node_modules/slack-edge/dist/oauth/installation.js
var require_installation = __commonJS({
  "node_modules/slack-edge/dist/oauth/installation.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toInstallation = toInstallation;
    function toInstallation(oauthAccess) {
      const installation = {
        app_id: oauthAccess.app_id,
        is_enterprise_install: oauthAccess.is_enterprise_install,
        enterprise_id: oauthAccess.enterprise?.id,
        team_id: oauthAccess.team?.id,
        user_id: oauthAccess.authed_user?.id,
        // bot token
        bot_token: oauthAccess.access_token,
        bot_user_id: oauthAccess.bot_user_id,
        bot_scopes: oauthAccess.scope?.split(","),
        bot_refresh_token: oauthAccess.refresh_token,
        bot_token_expires_at: oauthAccess.expires_in ? (/* @__PURE__ */ new Date()).getTime() / 1e3 + oauthAccess.expires_in : void 0,
        // user token
        user_token: oauthAccess.authed_user?.access_token,
        user_scopes: oauthAccess.authed_user?.scope?.split(","),
        user_refresh_token: oauthAccess.authed_user?.refresh_token,
        user_token_expires_at: oauthAccess.authed_user?.expires_in ? (/* @__PURE__ */ new Date()).getTime() / 1e3 + oauthAccess.authed_user?.expires_in : void 0,
        // Only when having incoming-webhooks
        incoming_webhook_url: oauthAccess.incoming_webhook?.url,
        incoming_webhook_channel_id: oauthAccess.incoming_webhook?.channel_id,
        incoming_webhook_configuration_url: oauthAccess.incoming_webhook?.url
      };
      return installation;
    }
  }
});

// node_modules/slack-edge/dist/oauth/escape-html.js
var require_escape_html = __commonJS({
  "node_modules/slack-edge/dist/oauth/escape-html.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.escapeHtml = escapeHtml;
    function escapeHtml(input) {
      if (input) {
        return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
      }
      return "";
    }
  }
});

// node_modules/slack-edge/dist/oauth/oauth-page-renderer.js
var require_oauth_page_renderer = __commonJS({
  "node_modules/slack-edge/dist/oauth/oauth-page-renderer.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderDefaultOAuthStartPage = renderDefaultOAuthStartPage;
    exports.renderSimpleCSSOAuthStartPage = renderSimpleCSSOAuthStartPage;
    exports.renderDefaultOAuthErrorPage = renderDefaultOAuthErrorPage;
    exports.renderSimpleCSSOAuthErrorPage = renderSimpleCSSOAuthErrorPage;
    exports.renderDefaultOAuthCompletionPage = renderDefaultOAuthCompletionPage;
    exports.renderSimpleCSSOAuthCompletionPage = renderSimpleCSSOAuthCompletionPage;
    var escape_html_1 = require_escape_html();
    async function renderDefaultOAuthStartPage({ url, immediateRedirect }) {
      const meta = immediateRedirect ? `<meta http-equiv="refresh" content="2;url=${(0, escape_html_1.escapeHtml)(url)}'" />` : "";
      return "<html><head>" + meta + '<title>Redirecting to Slack ...</title></head><body>Redirecting to the Slack OAuth page ... Click <a href="' + (0, escape_html_1.escapeHtml)(url) + '">here</a> to continue.</body></html>';
    }
    async function renderSimpleCSSOAuthStartPage({ url, immediateRedirect }) {
      const meta = immediateRedirect ? `<meta http-equiv="refresh" content="2;url=${(0, escape_html_1.escapeHtml)(url)}'" />` : "";
      return `<html>
      <head>
      ${meta}
      <title>Redirecting to Slack ...</title>
      <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
      </head>
      <body>
      <main>
      <h2>Installing Slack App</h2>
      <p>Redirecting to the Slack OAuth page ... Click <a href="${(0, escape_html_1.escapeHtml)(url)}">here</a> to continue.</p>
      </main>
      </body>
      </html>`;
    }
    async function renderDefaultOAuthErrorPage({ installPath, reason }) {
      return '<html><head><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h2>Oops, Something Went Wrong!</h2><p>Please try again from <a href="' + (0, escape_html_1.escapeHtml)(installPath) + '">here</a> or contact the app owner (reason: ' + (0, escape_html_1.escapeHtml)(reason.message) + ")</p></body></html>";
    }
    async function renderSimpleCSSOAuthErrorPage({ installPath, reason }) {
      return `<html>
      <head>
      <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
      </head>
      <body>
      <main>
      <h2>Oops, Something Went Wrong!</h2>
      <p>Please try again from <a href="${(0, escape_html_1.escapeHtml)(installPath)}">here</a> or contact the app owner (reason: ${(0, escape_html_1.escapeHtml)(reason.message)})</p>
      </main>
      </body>
      </html>`;
    }
    async function renderDefaultOAuthCompletionPage({ appId, teamId, isEnterpriseInstall, enterpriseUrl }) {
      let url = `slack://app?team=${teamId}&id=${appId}`;
      if (isEnterpriseInstall && enterpriseUrl !== void 0) {
        url = `${enterpriseUrl}manage/organization/apps/profile/${appId}/workspaces/add`;
      }
      const browserUrl = `https://app.slack.com/client/${teamId}`;
      return '<html><head><meta http-equiv="refresh" content="0; URL=' + (0, escape_html_1.escapeHtml)(url) + '"><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h2>Thank you!</h2><p>Redirecting to the Slack App... click <a href="' + (0, escape_html_1.escapeHtml)(url) + '">here</a>. If you use the browser version of Slack, click <a href="' + (0, escape_html_1.escapeHtml)(browserUrl) + '" target="_blank">this link</a> instead.</p></body></html>';
    }
    async function renderSimpleCSSOAuthCompletionPage({ appId, teamId, isEnterpriseInstall, enterpriseUrl }) {
      let url = `slack://app?team=${teamId}&id=${appId}`;
      if (isEnterpriseInstall && enterpriseUrl !== void 0) {
        url = `${enterpriseUrl}manage/organization/apps/profile/${appId}/workspaces/add`;
      }
      const browserUrl = `https://app.slack.com/client/${teamId}`;
      return `<html>
      <head>
      <meta http-equiv="refresh" content="0; URL=${(0, escape_html_1.escapeHtml)(url)}">
      <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
      </head>
      <body>
      <main>
      <h2>Thank you!</h2>
      <p>Redirecting to the Slack App... click <a href="${(0, escape_html_1.escapeHtml)(url)}">here</a>.
      If you use the browser version of Slack, click <a href="${(0, escape_html_1.escapeHtml)(browserUrl)}" target="_blank">this link</a> instead.</p>
      </main>
      </body>
      </html>`;
    }
  }
});

// node_modules/slack-edge/dist/oauth/hook.js
var require_hook = __commonJS({
  "node_modules/slack-edge/dist/oauth/hook.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultOnStateValidationError = defaultOnStateValidationError;
    exports.defaultOnFailure = defaultOnFailure;
    exports.defaultOAuthStart = defaultOAuthStart;
    exports.defaultOAuthCallback = defaultOAuthCallback;
    var error_codes_1 = require_error_codes();
    var oauth_page_renderer_1 = require_oauth_page_renderer();
    function defaultOnStateValidationError(renderer) {
      return async ({ startPath }) => {
        const renderPage = renderer ?? oauth_page_renderer_1.renderDefaultOAuthErrorPage;
        return new Response(await renderPage({
          installPath: startPath,
          reason: error_codes_1.InvalidStateParameter
        }), {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      };
    }
    function defaultOnFailure(renderer) {
      return async ({ startPath, reason }) => {
        const renderPage = renderer ?? oauth_page_renderer_1.renderDefaultOAuthErrorPage;
        return new Response(await renderPage({ installPath: startPath, reason }), {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      };
    }
    function defaultOAuthStart(startImmediateRedirect, renderer) {
      return async ({ authorizeUrl, stateCookieName, stateValue }) => {
        const immediateRedirect = startImmediateRedirect !== false;
        const status = immediateRedirect ? 302 : 200;
        const renderPage = renderer ?? oauth_page_renderer_1.renderDefaultOAuthStartPage;
        return new Response(await renderPage({ immediateRedirect, url: authorizeUrl }), {
          status,
          headers: {
            Location: authorizeUrl,
            "Set-Cookie": `${stateCookieName}=${stateValue}; Secure; HttpOnly; Path=/; Max-Age=300`,
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      };
    }
    function defaultOAuthCallback(renderer) {
      return async ({ oauthAccess, enterpriseUrl, stateCookieName, installation, authTestResponse }) => {
        const renderPage = renderer ?? oauth_page_renderer_1.renderDefaultOAuthCompletionPage;
        return new Response(await renderPage({
          appId: oauthAccess.app_id,
          teamId: oauthAccess.team?.id,
          isEnterpriseInstall: oauthAccess.is_enterprise_install,
          enterpriseUrl,
          installation,
          authTestResponse
        }), {
          status: 200,
          headers: {
            "Set-Cookie": `${stateCookieName}=deleted; Secure; HttpOnly; Path=/; Max-Age=0`,
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      };
    }
  }
});

// node_modules/slack-edge/dist/oidc/hook.js
var require_hook2 = __commonJS({
  "node_modules/slack-edge/dist/oidc/hook.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultOpenIDConnectCallback = void 0;
    var slack_web_api_client_1 = require_dist();
    var slack_web_api_client_2 = require_dist();
    var defaultOpenIDConnectCallback2 = async ({ env, token }) => {
      const client = new slack_web_api_client_1.SlackAPIClient(token.access_token, {
        logLevel: env.SLACK_LOGGING_LEVEL
      });
      const userInfo = await client.openid.connect.userInfo();
      const body = `<html><head><style>body {{ padding: 10px 15px; font-family: verdana; text-align: center; }}</style></head><body><h1>It works!</h1><p>This is the default handler. To change this, pass \`oidc: { callback: async (token, req) => new Response("TODO") }\` to your SlackOAuthApp constructor.</p><pre>${(0, slack_web_api_client_2.prettyPrint)(userInfo)}</pre></body></html>`;
      return new Response(body, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    };
    exports.defaultOpenIDConnectCallback = defaultOpenIDConnectCallback2;
  }
});

// node_modules/slack-edge/dist/oidc/authorize-url-generator.js
var require_authorize_url_generator2 = __commonJS({
  "node_modules/slack-edge/dist/oidc/authorize-url-generator.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateOIDCAuthorizeUrl = generateOIDCAuthorizeUrl;
    var errors_1 = require_errors2();
    function generateOIDCAuthorizeUrl(state, env) {
      if (!env.SLACK_OIDC_SCOPES) {
        throw new errors_1.ConfigError("env.SLACK_OIDC_SCOPES must be present when enabling Sign in with Slack (OpenID Connect)");
      }
      if (!env.SLACK_OIDC_REDIRECT_URI) {
        throw new errors_1.ConfigError("env.SLACK_OIDC_REDIRECT_URI must be present when enabling Sign in with Slack (OpenID Connect)");
      }
      let url = `https://slack.com/openid/connect/authorize?response_type=code&state=${state}`;
      url += `&client_id=${env.SLACK_CLIENT_ID}`;
      url += `&scope=${env.SLACK_OIDC_SCOPES}`;
      url += `&redirect_uri=${env.SLACK_OIDC_REDIRECT_URI}`;
      return url;
    }
  }
});

// node_modules/slack-edge/dist/oauth-app.js
var require_oauth_app = __commonJS({
  "node_modules/slack-edge/dist/oauth-app.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _SlackOAuthApp_instances;
    var _SlackOAuthApp_enableTokenRevocationHandlers;
    var _SlackOAuthApp_validateStateParameter;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlackOAuthApp = void 0;
    var execution_context_1 = require_execution_context();
    var app_1 = require_app();
    var state_store_1 = require_state_store();
    var authorize_url_generator_1 = require_authorize_url_generator();
    var cookie_1 = require_cookie();
    var slack_web_api_client_1 = require_dist();
    var installation_1 = require_installation();
    var hook_1 = require_hook();
    var hook_2 = require_hook2();
    var authorize_url_generator_2 = require_authorize_url_generator2();
    var error_codes_1 = require_error_codes();
    var SlackOAuthApp2 = class extends app_1.SlackApp {
      constructor(options) {
        super({
          env: options.env,
          authorize: options.installationStore.toAuthorize(),
          routes: { events: options.routes?.events ?? "/slack/events" }
        });
        _SlackOAuthApp_instances.add(this);
        this.env = options.env;
        this.installationStore = options.installationStore;
        this.stateStore = options.stateStore ?? new state_store_1.NoStorageStateStore();
        this.oauth = {
          stateCookieName: options.oauth?.stateCookieName ?? "slack-app-oauth-state",
          onFailure: options.oauth?.onFailure ?? (0, hook_1.defaultOnFailure)(options.oauth?.onFailureRenderer),
          onStateValidationError: options.oauth?.onStateValidationError ?? (0, hook_1.defaultOnStateValidationError)(options.oauth?.onStateValidationRenderer),
          redirectUri: options.oauth?.redirectUri ?? this.env.SLACK_REDIRECT_URI,
          start: options.oauth?.start ?? (0, hook_1.defaultOAuthStart)(options.oauth?.startImmediateRedirect, options.oauth?.startRenderer),
          beforeInstallation: options.oauth?.beforeInstallation,
          afterInstallation: options.oauth?.afterInstallation,
          callback: options.oauth?.callback ?? (0, hook_1.defaultOAuthCallback)(options.oauth?.callbackRenderer)
        };
        if (options.oidc) {
          this.oidc = {
            stateCookieName: options.oidc.stateCookieName ?? "slack-app-oidc-state",
            onFailure: options.oidc.onFailure ?? (0, hook_1.defaultOnFailure)(options.oidc?.onFailureRenderer),
            onStateValidationError: options.oidc.onStateValidationError ?? (0, hook_1.defaultOnStateValidationError)(options.oidc?.onStateValidationRenderer),
            start: options.oidc?.start ?? (0, hook_1.defaultOAuthStart)(options.oidc?.startImmediateRedirect, options.oidc?.startRenderer),
            callback: options.oidc.callback ?? hook_2.defaultOpenIDConnectCallback,
            redirectUri: options.oidc.redirectUri ?? this.env.SLACK_OIDC_REDIRECT_URI
          };
        } else {
          this.oidc = void 0;
        }
        this.routes = options.routes ? options.routes : {
          events: "/slack/events",
          oauth: {
            start: "/slack/install",
            callback: "/slack/oauth_redirect"
          },
          oidc: {
            start: "/slack/login",
            callback: "/slack/login/callback"
          }
        };
        __classPrivateFieldGet(this, _SlackOAuthApp_instances, "m", _SlackOAuthApp_enableTokenRevocationHandlers).call(this, options.installationStore);
      }
      async run(request, ctx = new execution_context_1.NoopExecutionContext()) {
        const url = new URL(request.url);
        if (request.method === "GET") {
          if (url.pathname === this.routes.oauth.start) {
            return await this.handleOAuthStartRequest(request);
          } else if (url.pathname === this.routes.oauth.callback) {
            return await this.handleOAuthCallbackRequest(request);
          }
          if (this.routes.oidc) {
            if (url.pathname === this.routes.oidc.start) {
              return await this.handleOIDCStartRequest(request);
            } else if (url.pathname === this.routes.oidc.callback) {
              return await this.handleOIDCCallbackRequest(request);
            }
          }
        } else if (request.method === "POST") {
          if (url.pathname === this.routes.events) {
            return await this.handleEventRequest(request, ctx);
          }
        }
        return new Response("Not found", { status: 404 });
      }
      /**
       * Handles an HTTP request from Slack's API server and returns a response to it.
       * @param request request
       * @param ctx execution context
       * @returns response
       */
      async handleEventRequest(request, ctx) {
        return await super.handleEventRequest(request, ctx);
      }
      /**
       * Handles an HTTP request to initiate the app-installation OAuth flow within a web browser.
       * @param request request
       * @returns response
       */
      async handleOAuthStartRequest(request) {
        const stateValue = await this.stateStore.issueNewState();
        const authorizeUrl = (0, authorize_url_generator_1.generateAuthorizeUrl)(stateValue, this.env);
        return await this.oauth.start({
          env: this.env,
          authorizeUrl,
          stateCookieName: this.oauth.stateCookieName,
          stateValue,
          request
        });
      }
      /**
       * Handles an HTTP request to handle the app-installation OAuth flow callback within a web browser.
       * @param request request
       * @returns response
       */
      async handleOAuthCallbackRequest(request) {
        const errorResponse = await __classPrivateFieldGet(this, _SlackOAuthApp_instances, "m", _SlackOAuthApp_validateStateParameter).call(this, request, this.routes.oauth.start, this.oauth.stateCookieName);
        if (errorResponse) {
          return errorResponse;
        }
        const { searchParams } = new URL(request.url);
        const error = searchParams.get("error");
        if (!error && error !== null) {
          return await this.oauth.onFailure({
            env: this.env,
            startPath: this.routes.oauth.start,
            reason: { code: error, message: `The installation process failed due to "${error}"` },
            request
          });
        }
        const code = searchParams.get("code");
        if (!code) {
          return await this.oauth.onFailure({
            env: this.env,
            startPath: this.routes.oauth.start,
            reason: error_codes_1.MissingCode,
            request
          });
        }
        if (this.oauth.beforeInstallation) {
          const response = await this.oauth.beforeInstallation({
            env: this.env,
            request
          });
          if (response) {
            return response;
          }
        }
        const client = new slack_web_api_client_1.SlackAPIClient(void 0, {
          logLevel: this.env.SLACK_LOGGING_LEVEL
        });
        let oauthAccess;
        try {
          oauthAccess = await client.oauth.v2.access({
            client_id: this.env.SLACK_CLIENT_ID,
            client_secret: this.env.SLACK_CLIENT_SECRET,
            redirect_uri: this.oauth.redirectUri,
            code
          });
        } catch (e3) {
          console.log(e3);
          return await this.oauth.onFailure({
            env: this.env,
            startPath: this.routes.oauth.start,
            reason: error_codes_1.InstallationError,
            request
          });
        }
        const installation = (0, installation_1.toInstallation)(oauthAccess);
        if (this.oauth.afterInstallation) {
          const response = await this.oauth.afterInstallation({
            env: this.env,
            request,
            installation
          });
          if (response) {
            return response;
          }
        }
        try {
          await this.installationStore.save(installation, request);
        } catch (e3) {
          console.log(e3);
          return await this.oauth.onFailure({
            env: this.env,
            startPath: this.routes.oauth.start,
            reason: error_codes_1.InstallationStoreError,
            request
          });
        }
        try {
          const authTestResponse = await client.auth.test({
            token: oauthAccess.access_token
          });
          const enterpriseUrl = authTestResponse.url;
          return await this.oauth.callback({
            env: this.env,
            oauthAccess,
            enterpriseUrl,
            stateCookieName: this.oauth.stateCookieName,
            installation,
            authTestResponse,
            request
          });
        } catch (e3) {
          console.log(e3);
          return await this.oauth.onFailure({
            env: this.env,
            startPath: this.routes.oauth.start,
            reason: error_codes_1.CompletionPageError,
            request
          });
        }
      }
      /**
       * Handles an HTTP request to initiate the SIWS flow within a web browser.
       * @param request request
       * @returns response
       */
      async handleOIDCStartRequest(request) {
        if (!this.oidc) {
          return new Response("Not found", { status: 404 });
        }
        const stateValue = await this.stateStore.issueNewState();
        const authorizeUrl = (0, authorize_url_generator_2.generateOIDCAuthorizeUrl)(stateValue, this.env);
        return await this.oauth.start({
          env: this.env,
          authorizeUrl,
          stateCookieName: this.oidc.stateCookieName,
          stateValue,
          request
        });
      }
      /**
       * Handles an HTTP request to handle the SIWS callback within a web browser.
       * @param request request
       * @returns response
       */
      async handleOIDCCallbackRequest(request) {
        if (!this.oidc || !this.routes.oidc) {
          return new Response("Not found", { status: 404 });
        }
        const errorResponse = await __classPrivateFieldGet(this, _SlackOAuthApp_instances, "m", _SlackOAuthApp_validateStateParameter).call(this, request, this.routes.oidc.start, this.oidc.stateCookieName);
        if (errorResponse) {
          return errorResponse;
        }
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        if (!code) {
          return await this.oidc.onFailure({
            env: this.env,
            startPath: this.routes.oidc.start,
            reason: error_codes_1.MissingCode,
            request
          });
        }
        try {
          const client = new slack_web_api_client_1.SlackAPIClient(void 0, {
            logLevel: this.env.SLACK_LOGGING_LEVEL
          });
          const token = await client.openid.connect.token({
            client_id: this.env.SLACK_CLIENT_ID,
            client_secret: this.env.SLACK_CLIENT_SECRET,
            redirect_uri: this.oidc.redirectUri,
            code
          });
          return await this.oidc.callback({
            env: this.env,
            token,
            request
          });
        } catch (e3) {
          console.log(e3);
          return await this.oidc.onFailure({
            env: this.env,
            startPath: this.routes.oidc.start,
            reason: error_codes_1.OpenIDConnectError,
            request
          });
        }
      }
    };
    exports.SlackOAuthApp = SlackOAuthApp2;
    _SlackOAuthApp_instances = /* @__PURE__ */ new WeakSet(), _SlackOAuthApp_enableTokenRevocationHandlers = function _SlackOAuthApp_enableTokenRevocationHandlers2(installationStore) {
      this.event("tokens_revoked", async ({ payload, body }) => {
        if (payload.tokens.bot) {
          try {
            await installationStore.deleteBotInstallation({
              enterpriseId: body.enterprise_id,
              teamId: body.team_id
            });
          } catch (e3) {
            console.log(`Failed to delete a bot installation (error: ${e3})`);
          }
        }
        if (payload.tokens.oauth) {
          for (const userId of payload.tokens.oauth) {
            try {
              await installationStore.deleteUserInstallation({
                enterpriseId: body.enterprise_id,
                teamId: body.team_id,
                userId
              });
            } catch (e3) {
              console.log(`Failed to delete a user installation (error: ${e3})`);
            }
          }
        }
      });
      this.event("app_uninstalled", async ({ body }) => {
        try {
          await installationStore.deleteAll({
            enterpriseId: body.enterprise_id,
            teamId: body.team_id
          });
        } catch (e3) {
          console.log(`Failed to delete all installation for an app_uninstalled event (error: ${e3})`);
        }
      });
      this.event("app_uninstalled_team", async ({ body }) => {
        try {
          await installationStore.deleteAll({
            enterpriseId: body.enterprise_id,
            teamId: body.team_id
          });
        } catch (e3) {
          console.log(`Failed to delete all installation for an app_uninstalled_team event (error: ${e3})`);
        }
      });
    }, _SlackOAuthApp_validateStateParameter = async function _SlackOAuthApp_validateStateParameter2(request, startPath, cookieName) {
      const { searchParams } = new URL(request.url);
      const queryState = searchParams.get("state");
      const cookie = (0, cookie_1.parse)(request.headers.get("Cookie") || "");
      const cookieState = cookie[cookieName];
      if (queryState !== cookieState || !await this.stateStore.consume(queryState)) {
        if (startPath === this.routes.oauth.start) {
          return await this.oauth.onStateValidationError({
            env: this.env,
            startPath,
            request
          });
        } else if (this.oidc && this.routes.oidc && startPath === this.routes.oidc.start) {
          return await this.oidc.onStateValidationError({
            env: this.env,
            startPath,
            request
          });
        }
      }
      return void 0;
    };
  }
});

// node_modules/slack-edge/dist/oauth/installation-store.js
var require_installation_store = __commonJS({
  "node_modules/slack-edge/dist/oauth/installation-store.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/oidc/login.js
var require_login = __commonJS({
  "node_modules/slack-edge/dist/oidc/login.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toLogin = toLogin;
    function toLogin(token, userInfo) {
      return {
        enterprise_id: userInfo["https://slack.com/enterprise_id"],
        team_id: userInfo["https://slack.com/team_id"],
        user_id: userInfo["https://slack.com/user_id"],
        email: userInfo.email,
        picture: userInfo.picture,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        token_expires_at: token.expires_in ? (/* @__PURE__ */ new Date()).getTime() / 1e3 + token.expires_in : void 0
      };
    }
  }
});

// node_modules/slack-edge/dist/request/request-body.js
var require_request_body = __commonJS({
  "node_modules/slack-edge/dist/request/request-body.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/request.js
var require_request2 = __commonJS({
  "node_modules/slack-edge/dist/request/request.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/block-action.js
var require_block_action = __commonJS({
  "node_modules/slack-edge/dist/request/payload/block-action.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/block-suggestion.js
var require_block_suggestion = __commonJS({
  "node_modules/slack-edge/dist/request/payload/block-suggestion.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/event.js
var require_event = __commonJS({
  "node_modules/slack-edge/dist/request/payload/event.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/global-shortcut.js
var require_global_shortcut = __commonJS({
  "node_modules/slack-edge/dist/request/payload/global-shortcut.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/message-shortcut.js
var require_message_shortcut = __commonJS({
  "node_modules/slack-edge/dist/request/payload/message-shortcut.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/slash-command.js
var require_slash_command = __commonJS({
  "node_modules/slack-edge/dist/request/payload/slash-command.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/view-submission.js
var require_view_submission = __commonJS({
  "node_modules/slack-edge/dist/request/payload/view-submission.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/view-closed.js
var require_view_closed = __commonJS({
  "node_modules/slack-edge/dist/request/payload/view-closed.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/request/payload/view-objects.js
var require_view_objects = __commonJS({
  "node_modules/slack-edge/dist/request/payload/view-objects.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/slack-edge/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/slack-edge/dist/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      var desc = Object.getOwnPropertyDescriptor(m4, k5);
      if (!desc || ("get" in desc ? !m4.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m4[k5];
        } };
      }
      Object.defineProperty(o5, k22, desc);
    } : function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      o5[k22] = m4[k5];
    });
    var __exportStar = exports && exports.__exportStar || function(m4, exports2) {
      for (var p8 in m4)
        if (p8 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p8))
          __createBinding(exports2, m4, p8);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_app(), exports);
    __exportStar(require_app_env(), exports);
    __exportStar(require_execution_context(), exports);
    __exportStar(require_dist(), exports);
    __exportStar(require_errors2(), exports);
    __exportStar(require_error_codes(), exports);
    __exportStar(require_handler(), exports);
    __exportStar(require_message_handler(), exports);
    __exportStar(require_options_handler(), exports);
    __exportStar(require_view_handler(), exports);
    __exportStar(require_authorize(), exports);
    __exportStar(require_authorize_result(), exports);
    __exportStar(require_single_team_authorize(), exports);
    __exportStar(require_middleware(), exports);
    __exportStar(require_built_in_middleware(), exports);
    __exportStar(require_context(), exports);
    __exportStar(require_oauth_app(), exports);
    __exportStar(require_authorize_url_generator(), exports);
    __exportStar(require_hook(), exports);
    __exportStar(require_escape_html(), exports);
    __exportStar(require_installation(), exports);
    __exportStar(require_installation_store(), exports);
    __exportStar(require_oauth_page_renderer(), exports);
    __exportStar(require_state_store(), exports);
    __exportStar(require_authorize_url_generator2(), exports);
    __exportStar(require_hook2(), exports);
    __exportStar(require_login(), exports);
    __exportStar(require_request_body(), exports);
    __exportStar(require_request_verification(), exports);
    __exportStar(require_request2(), exports);
    __exportStar(require_payload_types(), exports);
    __exportStar(require_block_action(), exports);
    __exportStar(require_block_suggestion(), exports);
    __exportStar(require_event(), exports);
    __exportStar(require_global_shortcut(), exports);
    __exportStar(require_message_shortcut(), exports);
    __exportStar(require_slash_command(), exports);
    __exportStar(require_view_submission(), exports);
    __exportStar(require_view_closed(), exports);
    __exportStar(require_view_objects(), exports);
    __exportStar(require_response(), exports);
    __exportStar(require_socket_mode_client(), exports);
    __exportStar(require_payload_handler(), exports);
    __exportStar(require_message_events(), exports);
  }
});

// node_modules/slack-cloudflare-workers/dist/kv-installation-store.js
var require_kv_installation_store = __commonJS({
  "node_modules/slack-cloudflare-workers/dist/kv-installation-store.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f7) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f7.call(receiver, value) : f7 ? f7.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _KVInstallationStore_env;
    var _KVInstallationStore_storage;
    var _KVInstallationStore_tokenRotator;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KVInstallationStore = void 0;
    exports.toBotInstallationQuery = toBotInstallationQuery;
    exports.toUserInstallationQuery = toUserInstallationQuery;
    exports.toBotInstallationKey = toBotInstallationKey;
    exports.toUserInstallationKey = toUserInstallationKey;
    var slack_edge_1 = require_dist2();
    var KVInstallationStore2 = class {
      constructor(env, namespace) {
        _KVInstallationStore_env.set(this, void 0);
        _KVInstallationStore_storage.set(this, void 0);
        _KVInstallationStore_tokenRotator.set(this, void 0);
        __classPrivateFieldSet(this, _KVInstallationStore_env, env, "f");
        __classPrivateFieldSet(this, _KVInstallationStore_storage, namespace, "f");
        __classPrivateFieldSet(this, _KVInstallationStore_tokenRotator, new slack_edge_1.TokenRotator({
          clientId: env.SLACK_CLIENT_ID,
          clientSecret: env.SLACK_CLIENT_SECRET
        }), "f");
      }
      async save(installation, request = void 0) {
        await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").put(toBotInstallationKey(__classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_CLIENT_ID, installation), JSON.stringify(installation));
        await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").put(toUserInstallationKey(__classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_CLIENT_ID, installation), JSON.stringify(installation));
      }
      async findBotInstallation(query) {
        const storedString = await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").get(toBotInstallationQuery(__classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_CLIENT_ID, query));
        if (storedString) {
          return JSON.parse(storedString);
        }
        return void 0;
      }
      async findUserInstallation(query) {
        const storedString = await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").get(toUserInstallationQuery(__classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_CLIENT_ID, query));
        if (storedString) {
          return JSON.parse(storedString);
        }
        return void 0;
      }
      async deleteBotInstallation(query) {
        await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").delete(toBotInstallationQuery(__classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_CLIENT_ID, query));
      }
      async deleteUserInstallation(query) {
        await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").delete(toUserInstallationQuery(__classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_CLIENT_ID, query));
      }
      async deleteAll(query) {
        const clientId = __classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_CLIENT_ID;
        if (!query.enterpriseId && !query.teamId) {
          return;
        }
        const e3 = query.enterpriseId ? query.enterpriseId : "_";
        const prefix = query.teamId ? `${clientId}/${e3}:${query.teamId}` : `${clientId}/${e3}:`;
        var keys = [];
        const first = await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").list({ prefix });
        keys = keys.concat(first.keys.map((k5) => k5.name));
        if (!first.list_complete) {
          var cursor = first.cursor;
          while (cursor) {
            const response = await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").list({ prefix, cursor });
            keys = keys.concat(response.keys.map((k5) => k5.name));
            cursor = response.list_complete ? void 0 : response.cursor;
          }
        }
        for (const key of keys) {
          await __classPrivateFieldGet(this, _KVInstallationStore_storage, "f").delete(key);
        }
      }
      toAuthorize() {
        return async (req) => {
          const query = {
            isEnterpriseInstall: req.context.isEnterpriseInstall,
            enterpriseId: req.context.enterpriseId,
            teamId: req.context.teamId,
            userId: req.context.userId
          };
          try {
            const bot = await this.findBotInstallation(query);
            if (bot && bot.bot_refresh_token) {
              const maybeRefreshed = await __classPrivateFieldGet(this, _KVInstallationStore_tokenRotator, "f").performRotation({
                bot: {
                  access_token: bot.bot_token,
                  refresh_token: bot.bot_refresh_token,
                  token_expires_at: bot.bot_token_expires_at
                }
              });
              if (maybeRefreshed && maybeRefreshed.bot) {
                bot.bot_token = maybeRefreshed.bot.access_token;
                bot.bot_refresh_token = maybeRefreshed.bot.refresh_token;
                bot.bot_token_expires_at = maybeRefreshed.bot.token_expires_at;
                await this.save(bot);
              }
            }
            const botClient = new slack_edge_1.SlackAPIClient(bot?.bot_token, {
              logLevel: __classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_LOGGING_LEVEL
            });
            const botAuthTest = await botClient.auth.test();
            const botScopes = botAuthTest.headers.get("x-oauth-scopes")?.split(",") ?? bot?.bot_scopes ?? [];
            const userQuery = {};
            Object.assign(userQuery, query);
            if (__classPrivateFieldGet(this, _KVInstallationStore_env, "f").SLACK_USER_TOKEN_RESOLUTION !== "installer") {
              userQuery.enterpriseId = req.context.actorEnterpriseId;
              userQuery.teamId = req.context.actorTeamId;
              userQuery.userId = req.context.actorUserId;
            }
            const user = await this.findUserInstallation(query);
            if (user && user.user_refresh_token) {
              const maybeRefreshed = await __classPrivateFieldGet(this, _KVInstallationStore_tokenRotator, "f").performRotation({
                user: {
                  access_token: user.user_token,
                  refresh_token: user.user_refresh_token,
                  token_expires_at: user.user_token_expires_at
                }
              });
              if (maybeRefreshed && maybeRefreshed.user) {
                user.user_token = maybeRefreshed.user.access_token;
                user.user_refresh_token = maybeRefreshed.user.refresh_token;
                user.user_token_expires_at = maybeRefreshed.user.token_expires_at;
                await this.save(user);
              }
            }
            let userAuthTest = void 0;
            if (user) {
              userAuthTest = await botClient.auth.test({ token: user.user_token });
            }
            return {
              enterpriseId: bot?.enterprise_id,
              teamId: bot?.team_id,
              team: botAuthTest.team,
              url: botAuthTest.url,
              botId: botAuthTest.bot_id,
              botUserId: botAuthTest.user_id,
              botToken: bot?.bot_token,
              botScopes,
              userId: user ? user.user_id : void 0,
              user: userAuthTest?.user,
              userToken: user?.user_token,
              userScopes: user?.user_scopes
            };
          } catch (e3) {
            throw new slack_edge_1.AuthorizeError(`Failed to authorize (error: ${e3}, query: ${JSON.stringify(query)})`);
          }
        };
      }
    };
    exports.KVInstallationStore = KVInstallationStore2;
    _KVInstallationStore_env = /* @__PURE__ */ new WeakMap(), _KVInstallationStore_storage = /* @__PURE__ */ new WeakMap(), _KVInstallationStore_tokenRotator = /* @__PURE__ */ new WeakMap();
    function toBotInstallationQuery(clientId, q2) {
      const e3 = q2.enterpriseId ? q2.enterpriseId : "_";
      const t5 = q2.teamId && !q2.isEnterpriseInstall ? q2.teamId : "_";
      return `${clientId}/${e3}:${t5}`;
    }
    function toUserInstallationQuery(clientId, q2) {
      const e3 = q2.enterpriseId ? q2.enterpriseId : "_";
      const t5 = q2.teamId && !q2.isEnterpriseInstall ? q2.teamId : "_";
      const u8 = q2.userId ? q2.userId : "_";
      return `${clientId}/${e3}:${t5}:${u8}`;
    }
    function toBotInstallationKey(clientId, installation) {
      const e3 = installation.enterprise_id ?? "_";
      const t5 = installation.team_id && !installation.is_enterprise_install ? installation.team_id : "_";
      return `${clientId}/${e3}:${t5}`;
    }
    function toUserInstallationKey(clientId, installation) {
      const e3 = installation.enterprise_id ?? "_";
      const t5 = installation.team_id && !installation.is_enterprise_install ? installation.team_id : "_";
      const u8 = installation.user_id ?? "_";
      return `${clientId}/${e3}:${t5}:${u8}`;
    }
  }
});

// node_modules/slack-cloudflare-workers/dist/kv-state-store.js
var require_kv_state_store = __commonJS({
  "node_modules/slack-cloudflare-workers/dist/kv-state-store.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f7) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f7.call(receiver, value) : f7 ? f7.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f7) {
      if (kind === "a" && !f7)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f7 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f7 : kind === "a" ? f7.call(receiver) : f7 ? f7.value : state.get(receiver);
    };
    var _KVStateStore_storage;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KVStateStore = void 0;
    var KVStateStore2 = class {
      constructor(namespace) {
        _KVStateStore_storage.set(this, void 0);
        __classPrivateFieldSet(this, _KVStateStore_storage, namespace, "f");
      }
      async issueNewState() {
        const state = crypto.randomUUID();
        await __classPrivateFieldGet(this, _KVStateStore_storage, "f").put(state, "valid", { expirationTtl: 300 });
        return state;
      }
      async consume(state) {
        const found = await __classPrivateFieldGet(this, _KVStateStore_storage, "f").get(state);
        if (found === "valid") {
          await __classPrivateFieldGet(this, _KVStateStore_storage, "f").delete(state);
          return true;
        }
        return false;
      }
    };
    exports.KVStateStore = KVStateStore2;
    _KVStateStore_storage = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/slack-cloudflare-workers/dist/index.js
var require_dist3 = __commonJS({
  "node_modules/slack-cloudflare-workers/dist/index.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      var desc = Object.getOwnPropertyDescriptor(m4, k5);
      if (!desc || ("get" in desc ? !m4.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m4[k5];
        } };
      }
      Object.defineProperty(o5, k22, desc);
    } : function(o5, m4, k5, k22) {
      if (k22 === void 0)
        k22 = k5;
      o5[k22] = m4[k5];
    });
    var __exportStar = exports && exports.__exportStar || function(m4, exports2) {
      for (var p8 in m4)
        if (p8 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p8))
          __createBinding(exports2, m4, p8);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_dist2(), exports);
    __exportStar(require_kv_installation_store(), exports);
    __exportStar(require_kv_state_store(), exports);
  }
});

// .wrangler/tmp/bundle-gDRb5B/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-gDRb5B/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// src/index.ts
init_checked_fetch();
init_modules_watch_stub();
var import_slack_cloudflare_workers = __toESM(require_dist3());

// src/slack/erande.ts
init_checked_fetch();
init_modules_watch_stub();

// src/slack/util.ts
init_checked_fetch();
init_modules_watch_stub();
var slackLink = /<(?<type>[@#!])?(?<link>[^>|]+)(?:\|(?<label>[^>]+))?>/;
function DirectMention(context, payload) {
  if (!context.botUserId) {
    return false;
  }
  const matches = slackLink.exec(payload.text.trim());
  if (!matches || matches.index !== 0) {
    return false;
  }
  const { groups } = matches;
  return Boolean(groups && groups.type === "@" && groups.link === context.botUserId);
}
function NoBotMessage(payload) {
  return payload.subtype === void 0;
}

// src/slack/erande.ts
function erande(app) {
  let pattern = /選んで\s(.+)/;
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload) && DirectMention(context, payload)) {
      const match = payload.text.match(pattern);
      if (match && match[1]) {
        console.log("erande: ", match[1]);
        const items = match[1].split(/\s/);
        const choice = items[Math.floor(Math.random() * items.length)];
        await context.say({
          text: `${choice} \u3092\u9078\u3093\u3067\u3042\u3052\u305F\u30D1\u30AB`
        });
      }
    }
  });
}

// src/google/image_search.ts
init_checked_fetch();
init_modules_watch_stub();
var GoogleImageSearch = class {
  env;
  fetcher;
  constructor(env, fetcher = fetch) {
    this.env = env;
    this.fetcher = fetcher;
  }
  async image_urls(q2) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q2)}&cx=${this.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID}&key=${this.env.GOOGLE_API_KEY}&searchType=image&safe=high`;
    const res = await this.fetcher(url);
    if (!res.ok) {
      return [];
    }
    const result = await res.json();
    return (result.items ?? []).map((i8) => i8.link).filter((l8) => !!l8 && !/ameba|fc2|pbs/.test(l8));
  }
};

// src/jpi/image_endpoint.ts
init_checked_fetch();
init_modules_watch_stub();
var PLACEHOLDER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#eeeeee"/>
  <text x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="24" fill="#666666">\u305D\u3093\u306A\u753B\u50CF\u306F\u306A\u3044\u30D1\u30AB</text>
</svg>`;
function placeholderResponse() {
  return new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
async function handleJpiImage(request, search, fetcher = fetch, random = Math.random) {
  const url = new URL(request.url);
  const q2 = url.searchParams.get("q")?.trim() ?? "";
  if (!q2) {
    return new Response("missing q", { status: 400 });
  }
  let urls2;
  try {
    urls2 = await search.image_urls(q2);
  } catch {
    return placeholderResponse();
  }
  if (urls2.length === 0) {
    return placeholderResponse();
  }
  const picked = urls2[Math.floor(random() * urls2.length)];
  try {
    const imgRes = await fetcher(picked);
    if (!imgRes.ok) {
      return placeholderResponse();
    }
    const buf = await imgRes.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": imgRes.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return placeholderResponse();
  }
}

// src/slack/jpi.ts
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/index.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/jsx.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/jsx-internals.mjs
init_checked_fetch();
init_modules_watch_stub();
var { defineProperty: c, create: d, keys: s, freeze: m } = Object;
var o = "$$jsxslack";
var i = o + "Component";
var h = (e3, r7 = null, ...l8) => {
  let t5 = d(null);
  if (typeof e3 == "function") {
    let n5 = { ...r7 || {} }, { length: a8 } = l8;
    a8 === 1 ? [n5.children] = l8 : a8 > 1 && (n5.children = l8), t5 = e3(n5);
  }
  if (t5 && typeof t5 == "object") {
    for (let n5 of s(t5))
      t5[n5] === void 0 && delete t5[n5];
    if (!t5[o]) {
      let n5 = l8;
      if (!l8.length) {
        let { children: a8 } = r7 || {};
        a8 !== void 0 && (n5 = [].concat(a8));
      }
      c(t5, o, { value: { type: e3, props: r7, children: n5 } });
    }
  }
  return t5;
};
var p = (e3, r7, l8 = {}) => c(r7, i, { value: m(c({ ...l8 }, "name", { value: e3, enumerable: true })) });
var u = p("Fragment", ({ children: e3 }) => [].concat(e3));
var y = (e3) => typeof e3 == "function" && !!Object.prototype.hasOwnProperty.call(e3, i);
var f = (e3) => typeof e3 == "object" && !!e3 && !!Object.prototype.hasOwnProperty.call(e3, o);
var b = (e3, r7) => f(e3) && y(e3[o].type) && (!r7 || e3[o].type === r7);
var j = (e3) => Array.isArray(e3) ? [...e3] : { ...e3 };

// node_modules/jsx-slack/module/src/jsx.mjs
function a(r7) {
  return r7;
}
((r7) => {
  r7.isValidElement = f, r7.createElement = h, r7.h = h, r7.Fragment = u;
  const c8 = (e3) => e3.reduce((n5, l8) => (Array.isArray(l8) && !b(l8) ? n5.push(...c8(l8)) : l8 == null || l8 === true || l8 === false ? n5.push(null) : n5.push(l8), n5), []), t5 = (e3) => c8([e3]);
  r7.Children = Object.freeze({ count: (e3) => e3 == null ? 0 : t5(e3).length, forEach: (e3, n5) => {
    r7.Children.map(e3, n5);
  }, map: (e3, n5) => e3 == null ? e3 : t5(e3).reduce((l8, o5, h4) => {
    const u8 = n5.call(o5, o5, h4);
    return u8 != null && l8.push(u8), l8;
  }, []), only: (e3) => {
    if ((0, r7.isValidElement)(e3))
      return e3;
    throw new Error("JSXSlack.Children.only expected to receive a single JSXSlack element child.");
  }, toArray: (e3) => t5(e3).reduce((n5, l8) => l8 == null ? n5 : b(l8, r7.Fragment) ? n5.concat(r7.Children.toArray([...l8])) : [...n5, l8], []) });
  let i8 = false;
  r7.exactMode = (e3) => (e3 !== void 0 && (i8 = e3), i8);
})(a || (a = {})), Object.freeze(a);

// node_modules/jsx-slack/module/src/block-kit/container/Blocks.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/block-kit/elements/Select.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/error.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/block-kit/utils.mjs
init_checked_fetch();
init_modules_watch_stub();
var l = (e3, t5) => Object.defineProperty(t5, "$$jsxslack", { value: e3.$$jsxslack });
var c2 = (e3, t5, r7 = true) => {
  const s8 = h(t5, e3.$$jsxslack.props, ...e3.$$jsxslack.children);
  return r7 && typeof s8 == "object" && s8 ? l(e3, j(s8)) : s8;
};
var i2 = (e3) => {
  if (a.isValidElement(e3)) {
    if (typeof e3.$$jsxslack.type == "string")
      return `<${e3.$$jsxslack.type}>`;
    if (y(e3.$$jsxslack.type))
      return `<${e3.$$jsxslack.type.$$jsxslackComponent.name}>`;
  }
};

// node_modules/jsx-slack/module/src/error.mjs
var c3 = (r7) => {
  var t5;
  const e3 = a.isValidElement(r7) ? (t5 = r7.$$jsxslack.props) == null ? void 0 : t5.__source : r7;
  if (typeof e3 == "object" && e3 && Object.prototype.hasOwnProperty.call(e3, "columnNumber") && Object.prototype.hasOwnProperty.call(e3, "fileName") && Object.prototype.hasOwnProperty.call(e3, "lineNumber"))
    return e3;
};
var l2 = class extends Error {
  constructor(t5, e3) {
    super(t5), this.name = new.target.name, this.originalStack = this.stack, Object.setPrototypeOf(this, new.target.prototype), this.resetStack(e3);
  }
  resetStack(t5) {
    const e3 = c3(t5);
    if (!e3)
      return;
    const o5 = i2(t5) || "JSX element";
    this.stack = `${this.name}: ${this.message}
    at ${o5} (${e3.fileName}:${e3.lineNumber}:${e3.columnNumber})`;
  }
};

// node_modules/jsx-slack/module/src/utils.mjs
init_checked_fetch();
init_modules_watch_stub();
var u2 = { m: 1e3, cm: 900, d: 500, cd: 400, c: 100, xc: 90, l: 50, xl: 40, x: 10, ix: 9, v: 5, iv: 4, i: 1 };
var s2 = (t5) => {
  if (t5 === "@channel" || t5 === "@everyone" || t5 === "@here")
    return t5;
  const r7 = t5.match(/^(#C|@[SUW])[A-Z0-9]{8,}$/);
  if (r7)
    return r7[1] === "#C" || r7[1] === "@S" ? r7[1] : "@UW";
};
var o2 = (t5) => {
  if (t5 === void 0)
    return;
  const r7 = Number.parseInt(t5.toString(), 10);
  if (!Number.isNaN(r7))
    return r7;
};
var a2 = (t5) => {
  if (typeof t5 == "string")
    return t5;
  if (typeof t5 == "number" || typeof t5 == "bigint")
    return t5.toString();
};
var c4 = (t5) => {
  const r7 = o2(t5);
  if (r7 === void 0)
    return t5.toString();
  if (r7 <= 0)
    return r7.toString();
  const n5 = Math.floor((r7 - 1) / 26);
  return (n5 > 0 ? c4(n5) : "") + String.fromCharCode((r7 - 1) % 26 + 97);
};
var g = (t5) => {
  let r7 = o2(t5);
  if (r7 === void 0)
    return t5.toString();
  if (r7 <= 0 || r7 >= 4e3)
    return r7.toString();
  let n5 = "";
  for (const [f7, e3] of Object.entries(u2)) {
    const i8 = Math.floor(r7 / e3);
    n5 += i8 > 0 ? f7.repeat(i8) : "", r7 %= e3;
  }
  return n5;
};

// node_modules/jsx-slack/module/src/block-kit/composition/utils.mjs
init_checked_fetch();
init_modules_watch_stub();
var s3 = (t5, r7 = false) => a.Children.toArray(t5).map((e3) => a.isValidElement(e3) ? r7 && e3.$$jsxslack.type === "br" ? `
` : s3(e3.$$jsxslack.children) : e3).join("");
var a3 = (t5, { emoji: r7 = true, layoutTags: e3 = false } = {}) => ({ type: "plain_text", text: typeof t5 == "string" ? t5 : s3(t5, e3), emoji: r7 });
var c5 = (t5) => {
  const r7 = {};
  let { dispatchAction: e3 } = t5;
  if (typeof e3 != "boolean" && e3) {
    Array.isArray(e3) || (e3 = e3.split(" "));
    const n5 = [...new Set(e3.filter((i8) => ["onEnterPressed", "onCharacterEntered"].includes(i8)).map((i8) => i8 === "onEnterPressed" ? "on_enter_pressed" : "on_character_entered"))];
    n5.length > 0 && (r7.trigger_actions_on = n5);
  }
  return Object.keys(r7).length > 0 ? r7 : void 0;
};

// node_modules/jsx-slack/module/src/block-kit/layout/Input.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/block-kit/elements/EmailTextInput.mjs
init_checked_fetch();
init_modules_watch_stub();
var e = p("EmailTextInput", (i8) => ({ type: "email_text_input", action_id: i8.actionId, placeholder: i8.placeholder ? a3(i8.placeholder, { emoji: false }) : void 0, initial_value: i8.initialValue, dispatch_action_config: i8.dispatchActionConfig, focus_on_load: i8.focusOnLoad }));

// node_modules/jsx-slack/module/src/block-kit/elements/NumberTextInput.mjs
init_checked_fetch();
init_modules_watch_stub();
var n = p("NumberTextInput", (i8) => {
  var a8;
  return { type: "number_input", action_id: i8.actionId, placeholder: i8.placeholder ? a3(i8.placeholder, { emoji: false }) : void 0, is_decimal_allowed: (a8 = i8.isDecimalAllowed) != null ? a8 : false, min_value: i8.minValue, max_value: i8.maxValue, initial_value: i8.initialValue, dispatch_action_config: i8.dispatchActionConfig, focus_on_load: i8.focusOnLoad };
});

// node_modules/jsx-slack/module/src/block-kit/elements/PlainTextInput.mjs
init_checked_fetch();
init_modules_watch_stub();
var o3 = p("PlainTextInput", (i8) => ({ type: "plain_text_input", action_id: i8.actionId, placeholder: i8.placeholder ? a3(i8.placeholder, { emoji: false }) : void 0, initial_value: i8.initialValue, multiline: i8.multiline, max_length: i8.maxLength, min_length: i8.minLength, dispatch_action_config: i8.dispatchActionConfig, focus_on_load: i8.focusOnLoad }));

// node_modules/jsx-slack/module/src/block-kit/elements/UrlTextInput.mjs
init_checked_fetch();
init_modules_watch_stub();
var t = p("UrlTextInput", (o5) => ({ type: "url_text_input", action_id: o5.actionId, placeholder: o5.placeholder ? a3(o5.placeholder, { emoji: false }) : void 0, initial_value: o5.initialValue, dispatch_action_config: o5.dispatchActionConfig, focus_on_load: o5.focusOnLoad }));

// node_modules/jsx-slack/module/src/block-kit/elements/utils.mjs
init_checked_fetch();
init_modules_watch_stub();
var u3 = (o5) => {
  if (o5.autoFocus !== void 0)
    return !!o5.autoFocus;
  if (o5.autofocus !== void 0)
    return !!o5.autofocus;
};

// node_modules/jsx-slack/module/src/block-kit/layout/Input.mjs
var p2 = ["channels_select", "checkboxes", "conversations_select", "datepicker", "datetimepicker", "email_text_input", "external_select", "multi_channels_select", "multi_conversations_select", "multi_external_select", "multi_static_select", "multi_users_select", "number_input", "plain_text_input", "radio_buttons", "static_select", "timepicker", "url_text_input", "users_select"];
var k = ({ element: e3, from: t5 }) => {
  if (typeof e3 != "object")
    throw new l2(`${t5} has invalid value as an element of input layout block.`);
  if (!p2.includes(e3.type)) {
    const i8 = i2(e3);
    throw new l2(`${t5} has detected an invalid type as the element of input layout block: "${e3.type}"${i8 ? ` (Provided by ${i8})` : ""}`, e3);
  }
  return j(e3);
};
var u4 = (e3, t5, i8) => {
  const d9 = j(h(k, { element: e3, from: i8 ? `<${i8.$$jsxslackComponent.name}>` : "Input layout block" }));
  if (t5.label) {
    const a8 = t5.hint || t5.title;
    return { type: "input", block_id: t5.blockId || t5.id, label: a3(t5.label), hint: a8 ? a3(a8) : void 0, optional: !t5.required, dispatch_action: t5.dispatchAction !== void 0 ? !!t5.dispatchAction : void 0, element: d9 };
  }
  return e3;
};
var s4 = p("Input", (e3) => e3.type === "hidden" || e3.type === "submit" ? {} : u4(e3.children || j((() => {
  const t5 = { actionId: e3.actionId || e3.name, placeholder: e3.placeholder, dispatchActionConfig: c5(e3), focusOnLoad: u3(e3) };
  return e3.type === "url" ? h(t, { ...t5, initialValue: a2(e3.value) || void 0 }) : e3.type === "email" ? h(e, { ...t5, initialValue: a2(e3.value) || void 0 }) : e3.type === "number" ? h(n, { ...t5, initialValue: a2(e3.value) || void 0, isDecimalAllowed: e3.decimal === void 0 ? void 0 : !!e3.decimal, maxValue: a2(e3.max), minValue: a2(e3.min) }) : h(o3, { ...t5, initialValue: e3.value, maxLength: o2(e3.maxLength), minLength: o2(e3.minLength) });
})()), { ...e3, dispatchAction: e3.dispatchAction === void 0 ? void 0 : !!e3.dispatchAction }, s4));

// node_modules/jsx-slack/module/src/block-kit/other/SelectFragment.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/block-kit/composition/Optgroup.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/block-kit/composition/Option.mjs
init_checked_fetch();
init_modules_watch_stub();
var r = Symbol("jsx-slack-option-selected");
var d2 = p("Option", ({ children: p8, description: e3, selected: o5, value: c8 }) => {
  const t5 = a3(p8), i8 = { text: t5, value: c8 || t5.text, description: e3 !== void 0 ? a3(e3) : void 0 };
  return o5 !== void 0 && Object.defineProperty(i8, r, { value: o5 }), i8;
});

// node_modules/jsx-slack/module/src/block-kit/composition/Optgroup.mjs
var d3 = p("Option", ({ children: p8, label: l8 }) => {
  const m4 = a.Children.toArray(p8).reduce((t5, r7) => {
    if (!a.isValidElement(r7))
      return t5;
    let o5 = r7;
    if (o5.$$jsxslack.type === "option" && (o5 = c2(o5, d2, false)), o5.$$jsxslack.type !== d2) {
      const e3 = i2(r7);
      throw new l2(`<Optgroup> must contain only <Option>${e3 ? ` but it is included ${e3}` : ""}.`, r7);
    }
    return [...t5, o5];
  }, []);
  return { label: a3(l8), options: m4 };
});

// node_modules/jsx-slack/module/src/block-kit/other/SelectFragment.mjs
var $ = Symbol("jsx-slack-select-fragment-selected-options");
var h2 = p("SelectFragment", ({ children: y6, from: s8 }) => {
  let i8 = 0, t5;
  const m4 = `<${(s8 == null ? void 0 : s8.$$jsxslackComponent.name) || "SelectFragment"}>`, l8 = [], c8 = a.Children.toArray(y6).reduce((a8, e3) => {
    if (!a.isValidElement(e3))
      return a8;
    let o5 = e3;
    e3.$$jsxslack.type === "option" && (o5 = c2(e3, d2, false)), e3.$$jsxslack.type === "optgroup" && (o5 = c2(e3, d3, false));
    const { type: n5 } = o5.$$jsxslack;
    if (n5 === d2)
      i8 += 1, o5[r] && l8.push(o5);
    else if (n5 === d3)
      i8 += o5.options.length, l8.push(...o5.options.filter((r7) => r7[r]));
    else {
      const r7 = i2(e3);
      throw new l2(`${m4} must contain either of <Option> or <Optgroup>${r7 ? ` but it is included ${r7}` : ""}.`, e3);
    }
    if (t5 && t5 !== n5)
      throw new l2(`<Option> and <Optgroup> cannot be mixed in the immediate children of ${m4}.`, e3);
    return t5 = n5, [...a8, o5];
  }, []);
  return i8 > 0 ? Object.defineProperty(t5 === d3 ? { option_groups: c8 } : { options: c8 }, $, { value: l8 }) : { options: [] };
});

// node_modules/jsx-slack/module/src/block-kit/elements/Select.mjs
var i3 = p("Select", (o5) => {
  const t5 = (() => b(o5.children, h2) ? o5.children : h(h2, { from: i3, children: o5.children }))();
  if (t5.options && t5.options.length === 0)
    throw new l2("<Select> must contain least of one <Option> or <Optgroup>.", o5.__source);
  const e3 = o5.value === void 0 ? t5[$] || [] : ((a8) => {
    const p8 = t5.options || [].concat(...t5.option_groups.map((n5) => n5.options)), s8 = [].concat(a8);
    return p8.filter((n5) => s8.includes(n5.value));
  })(o5.value), r7 = o5.actionId || o5.name, l8 = o5.placeholder !== void 0 ? a3(o5.placeholder) : void 0;
  return u4(o5.multiple ? { type: "multi_static_select", action_id: r7, placeholder: l8, ...t5, initial_options: e3.length > 0 ? e3 : void 0, max_selected_items: o2(o5.maxSelectedItems), confirm: o5.confirm, focus_on_load: u3(o5) } : { type: "static_select", action_id: r7, placeholder: l8, ...t5, initial_option: e3.length > 0 ? e3[e3.length - 1] : void 0, confirm: o5.confirm, focus_on_load: u3(o5) }, o5, i3);
});

// node_modules/jsx-slack/module/src/block-kit/input/Textarea.mjs
init_checked_fetch();
init_modules_watch_stub();
var e2 = p("Textarea", (o5) => u4(j(h(o3, { actionId: o5.actionId || o5.name, initialValue: o5.value, maxLength: o2(o5.maxLength), minLength: o2(o5.minLength), placeholder: o5.placeholder, multiline: true, dispatchActionConfig: c5(o5), focusOnLoad: u3(o5) })), { ...o5, dispatchAction: o5.dispatchAction === void 0 ? void 0 : !!o5.dispatchAction }, e2));

// node_modules/jsx-slack/module/src/block-kit/layout/Actions.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/block-kit/elements/Button.mjs
init_checked_fetch();
init_modules_watch_stub();
var t2 = p("Button", (e3) => {
  var l8;
  let i8;
  return e3.confirm && (i8 = e3.confirm, i8.style === void 0 && e3.style !== void 0 && (i8 = { ...i8, style: e3.style }, a.isValidElement(e3.confirm) && l(e3.confirm, i8))), { type: "button", action_id: e3.actionId || e3.name, accessibility_label: (l8 = e3.accessibilityLabel) != null ? l8 : e3["aria-label"], text: a3(e3.children), value: e3.value, url: e3.url, style: e3.style, confirm: i8 };
});

// node_modules/jsx-slack/module/src/block-kit/layout/utils.mjs
init_checked_fetch();
init_modules_watch_stub();
var l3 = (t5) => (o5) => {
  const e3 = i2(o5), r7 = b(o5);
  throw new l2(`<${t5}> cannot include the ${(() => e3 ? r7 && e3 !== "<Input>" ? `input component. Please remove "label" prop from <${e3.slice(1, -1)} label="...">.` : `element for "input" type: ${e3}` : 'element for "input" type.')()}`, o5);
};

// node_modules/jsx-slack/module/src/block-kit/layout/Actions.mjs
var l4 = (e3) => {
  const n5 = i2(e3);
  throw new l2(`<Actions> cannot include the element for selection from multiple options${n5 ? `: <${n5.slice(1, -1)} multiple>` : "."}`, e3);
};
var _ = ["button", "channels_select", "checkboxes", "conversations_select", "datepicker", "datetimepicker", "external_select", "overflow", "radio_buttons", "static_select", "timepicker", "users_select", "workflow_button"];
var v = { ..._.reduce((e3, n5) => ({ ...e3, [n5]: () => {
} }), {}), channels_select: (e3) => {
  if (e3.response_url_enabled)
    throw new l2("<ChannelsSelect responseUrlEnabled> is available only in the usage of input components.", e3);
}, conversations_select: (e3) => {
  if (e3.response_url_enabled)
    throw new l2("<ConversationsSelect responseUrlEnabled> is available only in the usage of input components.", e3);
}, multi_channels_select: l4, multi_conversations_select: l4, multi_external_select: l4, multi_static_select: l4, multi_users_select: l4, input: l3("Actions") };
var y2 = p("Actions", ({ blockId: e3, children: n5, id: d9, ...h4 }) => {
  const i8 = a.Children.toArray(n5).reduce((r7, t5) => {
    let o5 = t5;
    if (a.isValidElement(t5) && (t5.$$jsxslack.type === "button" && (o5 = c2(t5, t2)), t5.$$jsxslack.type === "select" && (o5 = c2(t5, i3))), typeof o5 == "object") {
      const c8 = v[o5.type];
      if (!c8) {
        const a8 = i2(t5);
        throw new l2(`<Actions> has detected an incompatible element in its children${a8 ? `: ${a8}` : "."}`, t5);
      }
      return c8(o5), [...r7, o5];
    }
    return r7;
  }, []);
  if (i8.length > 25)
    throw new l2(`<Actions> can contain up to 25 elements, but there are ${i8.length} elements.`, h4.__source);
  return { type: "actions", block_id: e3 || d9, elements: i8 };
});

// node_modules/jsx-slack/module/src/block-kit/layout/Divider.mjs
init_checked_fetch();
init_modules_watch_stub();
var d4 = p("Divider", ({ blockId: i8, id: e3 }) => ({ type: "divider", block_id: i8 || e3 }));

// node_modules/jsx-slack/module/src/block-kit/layout/Header.mjs
init_checked_fetch();
init_modules_watch_stub();
var d5 = p("Header", ({ blockId: e3, children: o5, id: t5 }) => ({ type: "header", block_id: e3 || t5, text: a3(o5, { layoutTags: true }) }));

// node_modules/jsx-slack/module/src/block-kit/layout/Image.mjs
init_checked_fetch();
init_modules_watch_stub();
var r2 = p("Image", ({ blockId: e3, id: o5, alt: i8, src: m4, title: t5 }) => ({ type: "image", block_id: e3 || o5, alt_text: i8, image_url: m4, title: t5 ? a3(t5) : void 0 }));

// node_modules/jsx-slack/module/src/block-kit/layout/Section.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/mrkdwn/jsx.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/date.mjs
init_checked_fetch();
init_modules_watch_stub();
var y3 = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var i4 = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var c6 = ["th", "st", "nd", "rd"];
var _2 = (e3) => {
  const s8 = e3 % 100;
  return `${e3}${c6[(s8 - 20) % 10] || c6[s8] || c6[0]}`;
};
function D(e3, s8) {
  const l8 = (r7 = false) => {
    let t5 = y3[e3.getUTCMonth()];
    r7 && (t5 = t5.slice(0, 3));
    let a8 = e3.getUTCDate();
    return r7 || (a8 = _2(a8)), `${t5} ${a8}, ${e3.getUTCFullYear()}`;
  }, $5 = (r7 = false) => {
    const t5 = `${e3.getUTCHours()}`.padStart(2, "0"), a8 = `${e3.getUTCMinutes()}`.padStart(2, "0"), d9 = e3.getUTCHours() >= 12 ? "PM" : "AM";
    if (!r7)
      return `${t5}:${a8} ${d9}`;
    const o5 = `${e3.getUTCSeconds()}`.padStart(2, "0");
    return `${t5}:${a8}:${o5} ${d9}`;
  }, u8 = (r7) => {
    const t5 = /* @__PURE__ */ new Date(), a8 = t5.getUTCFullYear(), d9 = t5.getUTCMonth(), o5 = t5.getUTCDate(), C3 = Date.UTC(a8, d9, o5 - 1, 0, 0, 0), p8 = Date.UTC(a8, d9, o5, 0, 0, 0), T3 = Date.UTC(a8, d9, o5 + 1, 0, 0, 0), U2 = Date.UTC(a8, d9, o5 + 2, 0, 0, 0) - 1, g6 = e3.getTime();
    let n5 = "";
    return C3 <= g6 && g6 < p8 && (n5 = "yesterday"), p8 <= g6 && g6 < T3 && (n5 = "today"), T3 <= g6 && g6 <= U2 && (n5 = "tomorrow"), n5 && r7 && (n5 = `${n5.slice(0, 1).toUpperCase()}${n5.slice(1)}`), n5;
  };
  return s8.replace(/{date_num}/g, () => {
    const r7 = `${e3.getUTCFullYear()}`.padStart(4, "0"), t5 = `${e3.getUTCMonth() + 1}`.padStart(2, "0"), a8 = `${e3.getUTCDate()}`.padStart(2, "0");
    return `${r7}-${t5}-${a8}`;
  }).replace(/{date_pretty}/g, (r7, t5) => u8(t5 === 0) || "{date}").replace(/{date_short_pretty}/g, (r7, t5) => u8(t5 === 0) || "{date_short}").replace(/{date_long_pretty}/g, (r7, t5) => u8(t5 === 0) || "{date_long}").replace(/{date}/g, () => l8()).replace(/{date_short}/g, () => l8(true)).replace(/{date_long}/g, () => `${i4[e3.getUTCDay()]}, ${l8()}`).replace(/{time}/g, () => $5()).replace(/{time_secs}/g, () => $5(true));
}

// node_modules/jsx-slack/module/src/mrkdwn/escape.mjs
init_checked_fetch();
init_modules_watch_stub();
var f2 = /(<[^>]*>|:[-a-z0-9ÀÁÂÃÄÇÈÉÊËÍÎÏÑÓÔÕÖŒœÙÚÛÜŸßàáâãäçèéêëíîïñóôõöùúûüÿ_＿+＋'\u1100-\u11ff\u2e80-\u2fd5\u3005\u3041-\u3096\u30a0-\u30ff\u3130-\u318f\u3400-\u4db5\u4e00-\u9fcb\ua960-\ua97f\uac00-\ud7ff\uff10-\uff19\uff41-\uff5a\uff61-\uff9f]+:)/;
var a4 = (e3) => (u8) => `<span data-escape="${e3.repeat(u8.length)}">${u8}</span>`;
var r3 = { blockquote: (e3) => e3.replace(/^((?:<(?:[^>]|>(?=<))*>)?)(&gt;)/gm, (u8, c8, t5) => `${c8}\xAD${t5}`).replace(/^((?:<(?:[^>]|>(?=<))*>)?)(＞)/gm, (u8, c8, t5) => `${c8}${a4("\xAD\uFF1E")(t5)}`), bold: (e3) => e3.replace(/\*+/g, a4("\u2217")).replace(/＊+/g, a4("\uFE61")), italic: (e3) => e3.replace(/_+/g, a4("\u02CD")).replace(/＿+/g, a4("\u2E0F")), code: (e3) => e3.replace(/`+/g, a4("\u02CB")).replace(/｀+/g, a4("\u02CB")), strikethrough: (e3) => e3.replace(/~+/g, a4("\u223C")) };
var g2 = (e3) => Object.values(r3).reduce((u8, c8) => c8(u8), e3);
var n2 = (e3, u8 = g2) => e3.split(f2).reduce((c8, t5, p8) => [...c8, p8 % 2 ? t5 : u8(t5)], []).join("");
var s5 = (e3) => e3.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
var i5 = (e3) => s5(e3).replace(/\|+/g, encodeURI);
var l5 = (e3, u8, c8) => e3.split(u8).reduce((t5, p8, o5) => t5.concat(o5 % 2 ? p8 : c8(p8)), []).join("");
var d6 = (e3) => l5(e3, /(<[\s\S]*?>)/, (u8) => l5(u8, /(&\w+;)/, (c8) => [...c8].map((t5) => `&#${t5.codePointAt(0)};`)));
var m2 = (e3) => typeof e3 == "string" ? e3.replace(/&(amp|gt|lt|quot|#\d+);/g, (u8, c8) => c8.startsWith("#") ? String.fromCodePoint(Number.parseInt(c8.slice(1), 10)) : { amp: "&", gt: ">", lt: "<", quot: '"' }[c8]) : e3;

// node_modules/jsx-slack/module/src/mrkdwn/jsx.mjs
var p3 = (t5, r7 = true) => {
  let i8 = "";
  for (const n5 of Object.keys(t5))
    if (t5[n5] != null && ["number", "bigint", "boolean", "string", "symbol"].includes(typeof t5[n5])) {
      let c8 = t5[n5].toString();
      r7 && (c8 = s5(c8)), i8 += ` ${n5}="${c8.replace(/"/g, "&quot;")}"`;
    }
  return i8;
};
var v2 = (t5, r7, i8, n5) => {
  var c8;
  const e3 = () => i8.join(""), l8 = (...a8) => n5.length > 0 && a8.some((s8) => s8 === n5[n5.length - 1]), o5 = (...a8) => a8.some((s8) => n5.includes(s8));
  if (t5 === "br")
    return "<br />";
  if (l8("pre", "code") && !["a", "time"].includes(t5))
    return e3();
  switch (t5) {
    case "b":
    case "strong":
      return o5("b", "strong", "time") ? e3() : `<b>${r3.bold(e3())}</b>`;
    case "i":
    case "em":
      return o5("i", "em", "time") ? e3() : `<i>${n2(e3(), r3.italic)}</i>`;
    case "s":
    case "strike":
    case "del":
      return o5("s", "strike", "del", "time") ? e3() : `<s>${r3.strikethrough(e3())}</s>`;
    case "code":
      return o5("time") ? e3() : `<code>${r3.code(e3())}</code>`;
    case "p":
      return o5("p") ? e3() : `<p>${e3()}</p>`;
    case "blockquote":
      return o5("blockquote", "ul", "ol", "time") ? e3() : `<blockquote>${r3.blockquote(e3())}</blockquote>`;
    case "pre":
      return o5("ul", "ol", "time") ? e3() : `<pre>${d6(e3().replace(/`{3}/g, "``\u02CB"))}</pre>`;
    case "a": {
      if (o5("a", "time"))
        return e3();
      let a8 = e3();
      return !a8 && r7.href && s2(r7.href) && (a8 = "specialLink"), `<a${p3(r7)}>${a8}</a>`;
    }
    case "time": {
      const a8 = (c8 = r7.dateTime) != null ? c8 : r7.datetime, s8 = Number.parseInt(a8, 10), u8 = new Date(Number.isNaN(s8) ? a8 : s8 * 1e3), f7 = Math.floor(u8.getTime() / 1e3), $5 = e3().replace(/\|/g, "\u01C0"), S2 = p3({ datetime: f7 }), C3 = r7.fallback ? p3({ "data-fallback": r7.fallback.replace(/\|/g, "\u01C0") }) : p3({ "data-fallback": D(u8, $5) }, false);
      return `<time${S2}${C3}>${d6($5)}</time>`;
    }
    case "small":
    case "span":
    case "ul":
      return `<${t5}>${e3()}</${t5}>`;
    case "ol":
    case "li":
      return `<${t5}${p3(r7)}>${e3()}</${t5}>`;
    default:
      throw new l2(`Unknown HTML-like element: ${t5}`, r7.__source);
  }
};
var y4 = p("Escape", a.Fragment.bind(null));
var b2 = (t5, r7, i8 = false) => {
  var n5;
  return ((n5 = a.Children.map(t5, (c8) => c8)) == null ? void 0 : n5.reduce((c8, e3) => {
    if (a.isValidElement(e3)) {
      const { type: l8, props: o5, children: a8 } = e3.$$jsxslack;
      if (typeof l8 == "string") {
        const f7 = b2(a8, [...r7, l8]);
        return [...c8, v2(l8, o5 || {}, f7, r7)];
      }
      const s8 = !i8 && l8 === y4, u8 = b2(a8, r7, s8);
      return c8.concat(s8 ? n2(u8.join("")) : u8);
    }
    return [...c8, s5(e3.toString())];
  }, [])) || [];
};

// node_modules/jsx-slack/module/src/block-kit/composition/Mrkdwn.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/mrkdwn/index.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/vendor/hastUtilToMdast.ts.mjs
init_checked_fetch();
init_modules_watch_stub();
var Z = -1;
var j2 = 0;
var E = 1;
var C = 2;
var F = 3;
var P = 4;
var H = 5;
var z = 6;
var tt = 7;
var et = 8;
var nt = typeof self == "object" ? self : globalThis;
var _t = (t5, n5) => {
  const e3 = (r7, i8) => (t5.set(i8, r7), r7), o5 = (r7) => {
    if (t5.has(r7))
      return t5.get(r7);
    const [i8, l8] = n5[r7];
    switch (i8) {
      case j2:
      case Z:
        return e3(l8, r7);
      case E: {
        const a8 = e3([], r7);
        for (const c8 of l8)
          a8.push(o5(c8));
        return a8;
      }
      case C: {
        const a8 = e3({}, r7);
        for (const [c8, u8] of l8)
          a8[o5(c8)] = o5(u8);
        return a8;
      }
      case F:
        return e3(new Date(l8), r7);
      case P: {
        const { source: a8, flags: c8 } = l8;
        return e3(new RegExp(a8, c8), r7);
      }
      case H: {
        const a8 = e3(/* @__PURE__ */ new Map(), r7);
        for (const [c8, u8] of l8)
          a8.set(o5(c8), o5(u8));
        return a8;
      }
      case z: {
        const a8 = e3(/* @__PURE__ */ new Set(), r7);
        for (const c8 of l8)
          a8.add(o5(c8));
        return a8;
      }
      case tt: {
        const { name: a8, message: c8 } = l8;
        return e3(new nt[a8](c8), r7);
      }
      case et:
        return e3(BigInt(l8), r7);
      case "BigInt":
        return e3(Object(BigInt(l8)), r7);
    }
    return e3(new nt[i8](l8), r7);
  };
  return o5;
};
var rt = (t5) => _t(/* @__PURE__ */ new Map(), t5)(0);
var N = "";
var { toString: $t } = {};
var { keys: Gt } = Object;
var k2 = (t5) => {
  const n5 = typeof t5;
  if (n5 !== "object" || !t5)
    return [j2, n5];
  const e3 = $t.call(t5).slice(8, -1);
  switch (e3) {
    case "Array":
      return [E, N];
    case "Object":
      return [C, N];
    case "Date":
      return [F, N];
    case "RegExp":
      return [P, N];
    case "Map":
      return [H, N];
    case "Set":
      return [z, N];
  }
  return e3.includes("Array") ? [E, e3] : e3.includes("Error") ? [tt, e3] : [C, e3];
};
var B = ([t5, n5]) => t5 === j2 && (n5 === "function" || n5 === "symbol");
var Kt = (t5, n5, e3, o5) => {
  const r7 = (l8, a8) => {
    const c8 = o5.push(l8) - 1;
    return e3.set(a8, c8), c8;
  }, i8 = (l8) => {
    if (e3.has(l8))
      return e3.get(l8);
    let [a8, c8] = k2(l8);
    switch (a8) {
      case j2: {
        let s8 = l8;
        switch (c8) {
          case "bigint":
            a8 = et, s8 = l8.toString();
            break;
          case "function":
          case "symbol":
            if (t5)
              throw new TypeError("unable to serialize " + c8);
            s8 = null;
            break;
          case "undefined":
            return r7([Z], l8);
        }
        return r7([a8, s8], l8);
      }
      case E: {
        if (c8)
          return r7([c8, [...l8]], l8);
        const s8 = [], h4 = r7([a8, s8], l8);
        for (const d9 of l8)
          s8.push(i8(d9));
        return h4;
      }
      case C: {
        if (c8)
          switch (c8) {
            case "BigInt":
              return r7([c8, l8.toString()], l8);
            case "Boolean":
            case "Number":
            case "String":
              return r7([c8, l8.valueOf()], l8);
          }
        if (n5 && "toJSON" in l8)
          return i8(l8.toJSON());
        const s8 = [], h4 = r7([a8, s8], l8);
        for (const d9 of Gt(l8))
          (t5 || !B(k2(l8[d9]))) && s8.push([i8(d9), i8(l8[d9])]);
        return h4;
      }
      case F:
        return r7([a8, l8.toISOString()], l8);
      case P: {
        const { source: s8, flags: h4 } = l8;
        return r7([a8, { source: s8, flags: h4 }], l8);
      }
      case H: {
        const s8 = [], h4 = r7([a8, s8], l8);
        for (const [d9, m4] of l8)
          (t5 || !(B(k2(d9)) || B(k2(m4)))) && s8.push([i8(d9), i8(m4)]);
        return h4;
      }
      case z: {
        const s8 = [], h4 = r7([a8, s8], l8);
        for (const d9 of l8)
          (t5 || !B(k2(d9))) && s8.push(i8(d9));
        return h4;
      }
    }
    const { message: u8 } = l8;
    return r7([a8, { name: c8, message: u8 }], l8);
  };
  return i8;
};
var ot = (t5, { json: n5, lossy: e3 } = {}) => {
  const o5 = [];
  return Kt(!(n5 || e3), !!n5, /* @__PURE__ */ new Map(), o5)(t5), o5;
};
var it = typeof structuredClone == "function" ? (t5, n5) => n5 && ("json" in n5 || "lossy" in n5) ? rt(ot(t5, n5)) : structuredClone(t5) : (t5, n5) => rt(ot(t5, n5));
var D2 = function(t5, n5, e3, o5, r7) {
  const i8 = v3(n5);
  if (e3 != null && (typeof e3 != "number" || e3 < 0 || e3 === Number.POSITIVE_INFINITY))
    throw new Error("Expected positive finite `index`");
  if (o5 != null && (!o5.type || !o5.children))
    throw new Error("Expected valid `parent`");
  if (e3 == null != (o5 == null))
    throw new Error("Expected both `index` and `parent`");
  return lt(t5) ? i8.call(r7, t5, e3, o5) : false;
};
var v3 = function(t5) {
  if (t5 == null)
    return Zt;
  if (typeof t5 == "string")
    return Xt(t5);
  if (typeof t5 == "object")
    return Qt(t5);
  if (typeof t5 == "function")
    return J(t5);
  throw new Error("Expected function, string, or array as `test`");
};
function Qt(t5) {
  const n5 = [];
  let e3 = -1;
  for (; ++e3 < t5.length; )
    n5[e3] = v3(t5[e3]);
  return J(o5);
  function o5(...r7) {
    let i8 = -1;
    for (; ++i8 < n5.length; )
      if (n5[i8].apply(this, r7))
        return true;
    return false;
  }
}
function Xt(t5) {
  return J(n5);
  function n5(e3) {
    return e3.tagName === t5;
  }
}
function J(t5) {
  return n5;
  function n5(e3, o5, r7) {
    return !!(lt(e3) && t5.call(this, e3, typeof o5 == "number" ? o5 : void 0, r7 || void 0));
  }
}
function Zt(t5) {
  return !!(t5 && typeof t5 == "object" && "type" in t5 && t5.type === "element" && "tagName" in t5 && typeof t5.tagName == "string");
}
function lt(t5) {
  return t5 !== null && typeof t5 == "object" && "type" in t5 && "tagName" in t5;
}
var at = v3(function(t5) {
  return t5.tagName === "audio" || t5.tagName === "canvas" || t5.tagName === "embed" || t5.tagName === "iframe" || t5.tagName === "img" || t5.tagName === "math" || t5.tagName === "object" || t5.tagName === "picture" || t5.tagName === "svg" || t5.tagName === "video";
});
var te = /[ \t\n\f\r]/g;
function ct(t5) {
  return typeof t5 == "object" ? t5.type === "text" ? st(t5.value) : false : st(t5);
}
function st(t5) {
  return t5.replace(te, "") === "";
}
var A = function(t5) {
  if (t5 == null)
    return oe;
  if (typeof t5 == "function")
    return M(t5);
  if (typeof t5 == "object")
    return Array.isArray(t5) ? ee(t5) : ne(t5);
  if (typeof t5 == "string")
    return re(t5);
  throw new Error("Expected function, string, or object as test");
};
function ee(t5) {
  const n5 = [];
  let e3 = -1;
  for (; ++e3 < t5.length; )
    n5[e3] = A(t5[e3]);
  return M(o5);
  function o5(...r7) {
    let i8 = -1;
    for (; ++i8 < n5.length; )
      if (n5[i8].apply(this, r7))
        return true;
    return false;
  }
}
function ne(t5) {
  const n5 = t5;
  return M(e3);
  function e3(o5) {
    const r7 = o5;
    let i8;
    for (i8 in t5)
      if (r7[i8] !== n5[i8])
        return false;
    return true;
  }
}
function re(t5) {
  return M(n5);
  function n5(e3) {
    return e3 && e3.type === t5;
  }
}
function M(t5) {
  return n5;
  function n5(e3, o5, r7) {
    return !!(ie(e3) && t5.call(this, e3, typeof o5 == "number" ? o5 : void 0, r7 || void 0));
  }
}
function oe() {
  return true;
}
function ie(t5) {
  return t5 !== null && typeof t5 == "object" && "type" in t5;
}
var le = ["address", "article", "aside", "blockquote", "body", "br", "caption", "center", "col", "colgroup", "dd", "dialog", "dir", "div", "dl", "dt", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "legend", "li", "li", "listing", "main", "menu", "nav", "ol", "optgroup", "option", "p", "plaintext", "pre", "section", "summary", "table", "tbody", "td", "td", "tfoot", "th", "th", "thead", "tr", "ul", "wbr", "xmp"];
var ae = ["button", "input", "select", "textarea"];
var ce = ["area", "base", "basefont", "dialog", "datalist", "head", "link", "meta", "noembed", "noframes", "param", "rp", "script", "source", "style", "template", "track", "title"];
var se = {};
var L = A(["doctype", "comment"]);
function ue(t5) {
  const n5 = ye((t5 || se).newlines ? ge : me);
  return function(e3) {
    ut(e3, { collapse: n5, whitespace: "normal" });
  };
}
function ut(t5, n5) {
  if ("children" in t5) {
    const e3 = { ...n5 };
    return (t5.type === "root" || ht(t5)) && (e3.before = true, e3.after = true), e3.whitespace = be(t5, n5), fe(t5, e3);
  }
  if (t5.type === "text") {
    if (n5.whitespace === "normal")
      return pe(t5, n5);
    n5.whitespace === "nowrap" && (t5.value = n5.collapse(t5.value));
  }
  return { ignore: L(t5), stripAtStart: false, remove: false };
}
function pe(t5, n5) {
  const e3 = n5.collapse(t5.value), o5 = { ignore: false, stripAtStart: false, remove: false };
  let r7 = 0, i8 = e3.length;
  return n5.before && dt(e3.charAt(0)) && r7++, r7 !== i8 && dt(e3.charAt(i8 - 1)) && (n5.after ? i8-- : o5.stripAtStart = true), r7 === i8 ? o5.remove = true : t5.value = e3.slice(r7, i8), o5;
}
function fe(t5, n5) {
  let e3 = n5.before;
  const o5 = n5.after, r7 = t5.children;
  let i8 = r7.length, l8 = -1;
  for (; ++l8 < i8; ) {
    const a8 = ut(r7[l8], { ...n5, after: pt(r7, l8, o5), before: e3 });
    a8.remove ? (r7.splice(l8, 1), l8--, i8--) : a8.ignore || (e3 = a8.stripAtStart), ft(r7[l8]) && (e3 = false);
  }
  return { ignore: false, stripAtStart: !!(e3 || o5), remove: false };
}
function pt(t5, n5, e3) {
  for (; ++n5 < t5.length; ) {
    const o5 = t5[n5];
    let r7 = he(o5);
    if (r7 === void 0 && "children" in o5 && !de(o5) && (r7 = pt(o5.children, -1)), typeof r7 == "boolean")
      return r7;
  }
  return e3;
}
function he(t5) {
  if (t5.type === "element") {
    if (ft(t5))
      return false;
    if (ht(t5))
      return true;
  } else if (t5.type === "text") {
    if (!ct(t5))
      return false;
  } else if (!L(t5))
    return false;
}
function ft(t5) {
  return at(t5) || D2(t5, ae);
}
function ht(t5) {
  return D2(t5, le);
}
function de(t5) {
  return !!(t5.type === "element" && t5.properties.hidden) || L(t5) || D2(t5, ce);
}
function dt(t5) {
  return t5 === " " || t5 === `
`;
}
function ge(t5) {
  const n5 = /\r?\n|\r/.exec(t5);
  return n5 ? n5[0] : " ";
}
function me() {
  return " ";
}
function ye(t5) {
  return n5;
  function n5(e3) {
    return String(e3).replace(/[\t\n\v\f\r ]+/g, t5);
  }
}
function be(t5, n5) {
  if ("tagName" in t5 && t5.properties)
    switch (t5.tagName) {
      case "listing":
      case "plaintext":
      case "script":
      case "style":
      case "xmp":
        return "pre";
      case "nobr":
        return "nowrap";
      case "pre":
        return t5.properties.wrap ? "pre-wrap" : "pre";
      case "td":
      case "th":
        return t5.properties.noWrap ? "nowrap" : n5.whitespace;
      case "textarea":
        return "pre-wrap";
    }
  return n5.whitespace;
}
var gt = [];
var ve = true;
var V = false;
var mt = "skip";
function we(t5, n5, e3, o5) {
  let r7;
  typeof n5 == "function" && typeof e3 != "function" ? (o5 = e3, e3 = n5) : r7 = n5;
  const i8 = A(r7), l8 = o5 ? -1 : 1;
  a8(t5, void 0, [])();
  function a8(c8, u8, s8) {
    const h4 = c8 && typeof c8 == "object" ? c8 : {};
    if (typeof h4.type == "string") {
      const m4 = typeof h4.tagName == "string" ? h4.tagName : typeof h4.name == "string" ? h4.name : void 0;
      Object.defineProperty(d9, "name", { value: "node (" + (c8.type + (m4 ? "<" + m4 + ">" : "")) + ")" });
    }
    return d9;
    function d9() {
      let m4 = gt, b5, y6, x;
      if ((!n5 || i8(c8, u8, s8[s8.length - 1] || void 0)) && (m4 = xe(e3(c8, s8)), m4[0] === V))
        return m4;
      if ("children" in c8 && c8.children) {
        const w2 = c8;
        if (w2.children && m4[0] !== mt)
          for (y6 = (o5 ? w2.children.length : -1) + l8, x = s8.concat(w2); y6 > -1 && y6 < w2.children.length; ) {
            const Yt = w2.children[y6];
            if (b5 = a8(Yt, y6, x)(), b5[0] === V)
              return b5;
            y6 = typeof b5[1] == "number" ? b5[1] : y6 + l8;
          }
      }
      return m4;
    }
  }
}
function xe(t5) {
  return Array.isArray(t5) ? t5 : typeof t5 == "number" ? [ve, t5] : t5 == null ? gt : [t5];
}
function U(t5, n5, e3, o5) {
  let r7, i8, l8;
  typeof n5 == "function" && typeof e3 != "function" ? (i8 = void 0, l8 = n5, r7 = e3) : (i8 = n5, l8 = e3, r7 = o5), we(t5, i8, a8, r7);
  function a8(c8, u8) {
    const s8 = u8[u8.length - 1], h4 = s8 ? s8.children.indexOf(c8) : void 0;
    return l8(c8, h4, s8);
  }
}
var Ne = yt("end");
var Se = yt("start");
function yt(t5) {
  return n5;
  function n5(e3) {
    const o5 = e3 && e3.position && e3.position[t5] || {};
    if (typeof o5.line == "number" && o5.line > 0 && typeof o5.column == "number" && o5.column > 0)
      return { line: o5.line, column: o5.column, offset: typeof o5.offset == "number" && o5.offset > -1 ? o5.offset : void 0 };
  }
}
function ke(t5) {
  const n5 = Se(t5), e3 = Ne(t5);
  if (n5 && e3)
    return { start: n5, end: e3 };
}
function Ae(t5, n5) {
  const e3 = n5.properties || {}, o5 = t5.all(n5), r7 = { type: "link", url: t5.resolve(String(e3.href || "") || null), title: e3.title ? String(e3.title) : null, children: o5 };
  return t5.patch(n5, r7), r7;
}
function Ie(t5, n5) {
  t5.baseFound || (t5.frozenBaseUrl = String(n5.properties && n5.properties.href || "") || void 0, t5.baseFound = true);
}
function Te(t5, n5) {
  const e3 = { type: "blockquote", children: t5.toFlow(t5.all(n5)) };
  return t5.patch(n5, e3), e3;
}
function je(t5, n5) {
  const e3 = { type: "break" };
  return t5.patch(n5, e3), e3;
}
var bt = function(t5, n5, e3) {
  const o5 = A(e3);
  if (!t5 || !t5.type || !t5.children)
    throw new Error("Expected parent node");
  if (typeof n5 == "number") {
    if (n5 < 0 || n5 === Number.POSITIVE_INFINITY)
      throw new Error("Expected positive finite number as index");
  } else if (n5 = t5.children.indexOf(n5), n5 < 0)
    throw new Error("Expected child node or index");
  for (; ++n5 < t5.children.length; )
    if (o5(t5.children[n5], n5, t5))
      return t5.children[n5];
};
var vt = /\n/g;
var wt = /[\t ]+/g;
var W = v3("br");
var xt = v3(Re);
var Ee = v3("p");
var Nt = v3("tr");
var Ce = v3(["datalist", "head", "noembed", "noframes", "noscript", "rp", "script", "style", "template", "title", Oe, qe]);
var St = v3(["address", "article", "aside", "blockquote", "body", "caption", "center", "dd", "dialog", "dir", "dl", "dt", "div", "figure", "figcaption", "footer", "form,", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "html", "legend", "listing", "main", "menu", "nav", "ol", "p", "plaintext", "pre", "section", "ul", "xmp"]);
function I(t5, n5 = {}) {
  const e3 = "children" in t5 ? t5.children : [], o5 = St(t5), r7 = It(t5, { whitespace: n5.whitespace || "normal", breakBefore: false, breakAfter: false }), i8 = [];
  (t5.type === "text" || t5.type === "comment") && i8.push(...At(t5, { whitespace: r7, breakBefore: true, breakAfter: true }));
  let l8 = -1;
  for (; ++l8 < e3.length; )
    i8.push(...kt(e3[l8], t5, { whitespace: r7, breakBefore: l8 ? void 0 : o5, breakAfter: l8 < e3.length - 1 ? W(e3[l8 + 1]) : o5 }));
  const a8 = [];
  let c8;
  for (l8 = -1; ++l8 < i8.length; ) {
    const u8 = i8[l8];
    typeof u8 == "number" ? c8 !== void 0 && u8 > c8 && (c8 = u8) : u8 && (c8 !== void 0 && c8 > -1 && a8.push(`
`.repeat(c8) || " "), c8 = -1, a8.push(u8));
  }
  return a8.join("");
}
function kt(t5, n5, e3) {
  return t5.type === "element" ? Be(t5, n5, e3) : t5.type === "text" ? e3.whitespace === "normal" ? At(t5, e3) : Me(t5) : [];
}
function Be(t5, n5, e3) {
  const o5 = It(t5, e3), r7 = t5.children || [];
  let i8 = -1, l8 = [];
  if (Ce(t5))
    return l8;
  let a8, c8;
  for (W(t5) || Nt(t5) && bt(n5, t5, Nt) ? c8 = `
` : Ee(t5) ? (a8 = 2, c8 = 2) : St(t5) && (a8 = 1, c8 = 1); ++i8 < r7.length; )
    l8 = l8.concat(kt(r7[i8], t5, { whitespace: o5, breakBefore: i8 ? void 0 : a8, breakAfter: i8 < r7.length - 1 ? W(r7[i8 + 1]) : c8 }));
  return xt(t5) && bt(n5, t5, xt) && l8.push("	"), a8 && l8.unshift(a8), c8 && l8.push(c8), l8;
}
function At(t5, n5) {
  const e3 = String(t5.value), o5 = [], r7 = [];
  let i8 = 0;
  for (; i8 <= e3.length; ) {
    vt.lastIndex = i8;
    const c8 = vt.exec(e3), u8 = c8 && "index" in c8 ? c8.index : e3.length;
    o5.push(Ue(e3.slice(i8, u8).replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ""), i8 === 0 ? n5.breakBefore : true, u8 === e3.length ? n5.breakAfter : true)), i8 = u8 + 1;
  }
  let l8 = -1, a8;
  for (; ++l8 < o5.length; )
    o5[l8].charCodeAt(o5[l8].length - 1) === 8203 || l8 < o5.length - 1 && o5[l8 + 1].charCodeAt(0) === 8203 ? (r7.push(o5[l8]), a8 = void 0) : o5[l8] ? (typeof a8 == "number" && r7.push(a8), r7.push(o5[l8]), a8 = 0) : (l8 === 0 || l8 === o5.length - 1) && r7.push(0);
  return r7;
}
function Me(t5) {
  return [String(t5.value)];
}
function Ue(t5, n5, e3) {
  const o5 = [];
  let r7 = 0, i8;
  for (; r7 < t5.length; ) {
    wt.lastIndex = r7;
    const l8 = wt.exec(t5);
    i8 = l8 ? l8.index : t5.length, !r7 && !i8 && l8 && !n5 && o5.push(""), r7 !== i8 && o5.push(t5.slice(r7, i8)), r7 = l8 ? i8 + l8[0].length : i8;
  }
  return r7 !== i8 && !e3 && o5.push(""), o5.join(" ");
}
function It(t5, n5) {
  if (t5.type === "element") {
    const e3 = t5.properties || {};
    switch (t5.tagName) {
      case "listing":
      case "plaintext":
      case "xmp":
        return "pre";
      case "nobr":
        return "nowrap";
      case "pre":
        return e3.wrap ? "pre-wrap" : "pre";
      case "td":
      case "th":
        return e3.noWrap ? "nowrap" : n5.whitespace;
      case "textarea":
        return "pre-wrap";
    }
  }
  return n5.whitespace;
}
function Oe(t5) {
  return !!(t5.properties || {}).hidden;
}
function Re(t5) {
  return t5.tagName === "td" || t5.tagName === "th";
}
function qe(t5) {
  return t5.tagName === "dialog" && !(t5.properties || {}).open;
}
function Fe(t5) {
  const n5 = String(t5);
  let e3 = n5.length;
  for (; e3 > 0; ) {
    const o5 = n5.codePointAt(e3 - 1);
    if (o5 !== void 0 && (o5 === 10 || o5 === 13))
      e3--;
    else
      break;
  }
  return n5.slice(0, e3);
}
var Y = "language-";
function O(t5, n5) {
  const e3 = n5.children;
  let o5 = -1, r7, i8;
  if (n5.tagName === "pre")
    for (; ++o5 < e3.length; ) {
      const a8 = e3[o5];
      if (a8.type === "element" && a8.tagName === "code" && a8.properties && a8.properties.className && Array.isArray(a8.properties.className)) {
        r7 = a8.properties.className;
        break;
      }
    }
  if (r7) {
    for (o5 = -1; ++o5 < r7.length; )
      if (String(r7[o5]).slice(0, Y.length) === Y) {
        i8 = String(r7[o5]).slice(Y.length);
        break;
      }
  }
  const l8 = { type: "code", lang: i8 || null, meta: null, value: Fe(I(n5)) };
  return t5.patch(n5, l8), l8;
}
function Pe(t5, n5) {
  const e3 = { type: "html", value: "<!--" + n5.value + "-->" };
  return t5.patch(n5, e3), e3;
}
function _3(t5, n5) {
  const e3 = { type: "delete", children: t5.all(n5) };
  return t5.patch(n5, e3), e3;
}
function $2(t5) {
  let n5 = -1;
  if (t5.length > 1) {
    for (; ++n5 < t5.length; )
      if (t5[n5].spread)
        return true;
  }
  return false;
}
function He(t5, n5) {
  const e3 = [], o5 = [];
  let r7 = -1;
  for (; ++r7 < n5.children.length; ) {
    const a8 = n5.children[r7];
    a8.type === "element" && a8.tagName === "div" ? e3.push(...a8.children) : e3.push(a8);
  }
  let i8 = { definitions: [], titles: [] };
  for (r7 = -1; ++r7 < e3.length; ) {
    const a8 = e3[r7];
    if (a8.type === "element" && a8.tagName === "dt") {
      const c8 = e3[r7 - 1];
      c8 && c8.type === "element" && c8.tagName === "dd" && (o5.push(i8), i8 = { definitions: [], titles: [] }), i8.titles.push(a8);
    } else
      i8.definitions.push(a8);
  }
  o5.push(i8), r7 = -1;
  const l8 = [];
  for (; ++r7 < o5.length; ) {
    const a8 = [...Tt(t5, o5[r7].titles), ...Tt(t5, o5[r7].definitions)];
    a8.length > 0 && l8.push({ type: "listItem", spread: a8.length > 1, checked: null, children: a8 });
  }
  if (l8.length > 0) {
    const a8 = { type: "list", ordered: false, start: null, spread: $2(l8), children: l8 };
    return t5.patch(n5, a8), a8;
  }
}
function Tt(t5, n5) {
  const e3 = t5.all({ type: "root", children: n5 }), o5 = t5.toSpecificContent(e3, ze);
  return o5.length === 0 ? [] : o5.length === 1 ? o5[0].children : [{ type: "list", ordered: false, start: null, spread: $2(o5), children: o5 }];
}
function ze() {
  return { type: "listItem", spread: false, checked: null, children: [] };
}
function R(t5, n5) {
  const e3 = { type: "emphasis", children: t5.all(n5) };
  return t5.patch(n5, e3), e3;
}
function S(t5, n5) {
  const e3 = Number(n5.tagName.charAt(1)) || 1, o5 = t5.all(n5), r7 = { type: "heading", depth: e3, children: o5 };
  return t5.patch(n5, r7), r7;
}
function De(t5, n5) {
  const e3 = { type: "thematicBreak" };
  return t5.patch(n5, e3), e3;
}
function Je(t5, n5) {
  const e3 = n5.properties || {}, o5 = String(e3.src || ""), r7 = String(e3.title || "");
  if (o5 && r7) {
    const i8 = { type: "link", title: null, url: t5.resolve(o5), children: [{ type: "text", value: r7 }] };
    return t5.patch(n5, i8), i8;
  }
}
function jt(t5, n5) {
  const e3 = n5.properties || {}, o5 = { type: "image", url: t5.resolve(String(e3.src || "") || null), title: e3.title ? String(e3.title) : null, alt: e3.alt ? String(e3.alt) : "" };
  return t5.patch(n5, o5), o5;
}
function T(t5, n5) {
  const e3 = { type: "inlineCode", value: I(n5) };
  return t5.patch(n5, e3), e3;
}
function Et(t5, n5) {
  const e3 = [], o5 = [], r7 = n5 || t5.properties || {}, i8 = Ct(t5), l8 = Math.min(Number.parseInt(String(r7.size), 10), 0) || (r7.multiple ? 4 : 1);
  let a8 = -1;
  for (; ++a8 < i8.length; ) {
    const s8 = i8[a8];
    s8 && s8.properties && s8.properties.selected && e3.push(s8);
  }
  const c8 = e3.length > 0 ? e3 : i8, u8 = c8.length > l8 ? l8 : c8.length;
  for (a8 = -1; ++a8 < u8; ) {
    const s8 = c8[a8], h4 = s8.properties || {}, d9 = I(s8), m4 = d9 || String(h4.label || ""), b5 = String(h4.value || "") || d9;
    o5.push([b5, m4 === b5 ? void 0 : m4]);
  }
  return o5;
}
function Ct(t5) {
  const n5 = [];
  let e3 = -1;
  for (; ++e3 < t5.children.length; ) {
    const o5 = t5.children[e3];
    "children" in o5 && Array.isArray(o5.children) && n5.push(...Ct(o5)), o5.type === "element" && o5.tagName === "option" && (!o5.properties || !o5.properties.disabled) && n5.push(o5);
  }
  return n5;
}
var Le = "[x]";
var Ve = "[ ]";
function We(t5, n5) {
  const e3 = n5.properties || {}, o5 = String(e3.value || e3.placeholder || "");
  if (e3.disabled || e3.type === "hidden" || e3.type === "file")
    return;
  if (e3.type === "checkbox" || e3.type === "radio") {
    const c8 = { type: "text", value: e3.checked ? t5.options.checked || Le : t5.options.unchecked || Ve };
    return t5.patch(n5, c8), c8;
  }
  if (e3.type === "image") {
    const c8 = e3.alt || o5;
    if (c8) {
      const u8 = { type: "image", url: t5.resolve(String(e3.src || "") || null), title: String(e3.title || "") || null, alt: String(c8) };
      return t5.patch(n5, u8), u8;
    }
    return;
  }
  let r7 = [];
  if (o5)
    r7 = [[o5, void 0]];
  else if (e3.type !== "button" && e3.type !== "file" && e3.type !== "password" && e3.type !== "reset" && e3.type !== "submit" && e3.list) {
    const c8 = String(e3.list), u8 = t5.elementById.get(c8);
    u8 && u8.tagName === "datalist" && (r7 = Et(u8, e3));
  }
  if (r7.length === 0)
    return;
  if (e3.type === "password" && (r7[0] = ["\u2022".repeat(r7[0][0].length), void 0]), e3.type === "email" || e3.type === "url") {
    const c8 = [];
    let u8 = -1;
    for (; ++u8 < r7.length; ) {
      const s8 = t5.resolve(r7[u8][0]), h4 = { type: "link", title: null, url: e3.type === "email" ? "mailto:" + s8 : s8, children: [{ type: "text", value: r7[u8][1] || s8 }] };
      c8.push(h4), u8 !== r7.length - 1 && c8.push({ type: "text", value: ", " });
    }
    return c8;
  }
  const i8 = [];
  let l8 = -1;
  for (; ++l8 < r7.length; )
    i8.push(r7[l8][1] ? r7[l8][1] + " (" + r7[l8][0] + ")" : r7[l8][0]);
  const a8 = { type: "text", value: i8.join(", ") };
  return t5.patch(n5, a8), a8;
}
var Ye = {}.hasOwnProperty;
function _e(t5, n5) {
  const e3 = t5.type === "element" && Ye.call(t5.properties, n5) && t5.properties[n5];
  return e3 != null && e3 !== false;
}
var $e = /* @__PURE__ */ new Set(["pingback", "prefetch", "stylesheet"]);
function Ge(t5) {
  if (t5.type !== "element" || t5.tagName !== "link")
    return false;
  if (t5.properties.itemProp)
    return true;
  const n5 = t5.properties.rel;
  let e3 = -1;
  if (!Array.isArray(n5) || n5.length === 0)
    return false;
  for (; ++e3 < n5.length; )
    if (!$e.has(String(n5[e3])))
      return false;
  return true;
}
var Ke = v3(["a", "abbr", "area", "b", "bdi", "bdo", "br", "button", "cite", "code", "data", "datalist", "del", "dfn", "em", "i", "input", "ins", "kbd", "keygen", "label", "map", "mark", "meter", "noscript", "output", "progress", "q", "ruby", "s", "samp", "script", "select", "small", "span", "strong", "sub", "sup", "template", "textarea", "time", "u", "var", "wbr"]);
var Qe = v3("meta");
function Bt(t5) {
  return !!(t5.type === "text" || Ke(t5) || at(t5) || Ge(t5) || Qe(t5) && _e(t5, "itemProp"));
}
function G(t5, n5) {
  const { rest: e3, checkbox: o5 } = Ut(n5), r7 = o5 ? !!o5.properties.checked : null, i8 = Mt(e3), l8 = t5.toFlow(t5.all(e3)), a8 = { type: "listItem", spread: i8, checked: r7, children: l8 };
  return t5.patch(n5, a8), a8;
}
function Mt(t5) {
  let n5 = -1, e3 = false;
  for (; ++n5 < t5.children.length; ) {
    const o5 = t5.children[n5];
    if (o5.type === "element") {
      if (Bt(o5))
        continue;
      if (o5.tagName === "p" || e3 || Mt(o5))
        return true;
      e3 = true;
    }
  }
  return false;
}
function Ut(t5) {
  const n5 = t5.children[0];
  if (n5 && n5.type === "element" && n5.tagName === "input" && n5.properties && (n5.properties.type === "checkbox" || n5.properties.type === "radio")) {
    const e3 = { ...t5, children: t5.children.slice(1) };
    return { checkbox: n5, rest: e3 };
  }
  if (n5 && n5.type === "element" && n5.tagName === "p") {
    const { checkbox: e3, rest: o5 } = Ut(n5);
    if (e3) {
      const r7 = { ...t5, children: [o5, ...t5.children.slice(1)] };
      return { checkbox: e3, rest: r7 };
    }
  }
  return { checkbox: void 0, rest: t5 };
}
function K(t5, n5) {
  const e3 = n5.tagName === "ol", o5 = t5.toSpecificContent(t5.all(n5), Xe);
  let r7 = null;
  e3 && (r7 = n5.properties && n5.properties.start ? Number.parseInt(String(n5.properties.start), 10) : 1);
  const i8 = { type: "list", ordered: e3, start: r7, spread: $2(o5), children: o5 };
  return t5.patch(n5, i8), i8;
}
function Xe() {
  return { type: "listItem", spread: false, checked: null, children: [] };
}
var Ze = {};
function tn(t5, n5) {
  const e3 = n5 || Ze, o5 = typeof e3.includeImageAlt == "boolean" ? e3.includeImageAlt : true, r7 = typeof e3.includeHtml == "boolean" ? e3.includeHtml : true;
  return Ot(t5, o5, r7);
}
function Ot(t5, n5, e3) {
  if (en(t5)) {
    if ("value" in t5)
      return t5.type === "html" && !e3 ? "" : t5.value;
    if (n5 && "alt" in t5 && t5.alt)
      return t5.alt;
    if ("children" in t5)
      return Rt(t5.children, n5, e3);
  }
  return Array.isArray(t5) ? Rt(t5, n5, e3) : "";
}
function Rt(t5, n5, e3) {
  const o5 = [];
  let r7 = -1;
  for (; ++r7 < t5.length; )
    o5[r7] = Ot(t5[r7], n5, e3);
  return o5.join("");
}
function en(t5) {
  return !!(t5 && typeof t5 == "object");
}
var nn = A(["break", "delete", "emphasis", "footnote", "footnoteReference", "image", "imageReference", "inlineCode", "link", "linkReference", "strong", "text"]);
function q(t5) {
  let n5 = -1;
  for (; ++n5 < t5.length; ) {
    const e3 = t5[n5];
    if (!Pt(e3) || "children" in e3 && q(e3.children))
      return true;
  }
  return false;
}
function qt(t5) {
  return Ft(t5, n5, function(e3) {
    return e3;
  });
  function n5(e3) {
    return e3.every(function(o5) {
      return o5.type === "text" ? ct(o5.value) : false;
    }) ? [] : [{ type: "paragraph", children: e3 }];
  }
}
function rn(t5) {
  return Ft(t5.children, n5, e3);
  function n5(o5) {
    const r7 = Q(t5);
    return r7.children = o5, [r7];
  }
  function e3(o5) {
    if ("children" in o5 && "children" in t5) {
      const r7 = Q(t5), i8 = Q(o5);
      return r7.children = o5.children, i8.children.push(r7), i8;
    }
    return { ...o5 };
  }
}
function Ft(t5, n5, e3) {
  const o5 = on(t5), r7 = [];
  let i8 = [], l8 = -1;
  for (; ++l8 < o5.length; ) {
    const a8 = o5[l8];
    Pt(a8) ? i8.push(a8) : (i8.length > 0 && (r7.push(...n5(i8)), i8 = []), r7.push(e3(a8)));
  }
  return i8.length > 0 && (r7.push(...n5(i8)), i8 = []), r7;
}
function on(t5) {
  const n5 = [];
  let e3 = -1;
  for (; ++e3 < t5.length; ) {
    const o5 = t5[e3];
    (o5.type === "delete" || o5.type === "link") && q(o5.children) ? n5.push(...rn(o5)) : n5.push(o5);
  }
  return n5;
}
function Pt(t5) {
  const n5 = t5.data && t5.data.hName;
  return n5 ? Bt({ type: "element", tagName: n5, properties: {}, children: [] }) : nn(t5);
}
function Q(t5) {
  return it({ ...t5, children: [] });
}
function Ht(t5, n5) {
  const e3 = n5.properties || {}, o5 = n5.tagName === "video" ? String(e3.poster || "") : "";
  let r7 = String(e3.src || ""), i8 = -1, l8 = false, a8 = t5.all(n5);
  if (U({ type: "root", children: a8 }, function(s8) {
    if (s8.type === "link")
      return l8 = true, V;
  }), l8 || q(a8))
    return a8;
  for (; !r7 && ++i8 < n5.children.length; ) {
    const s8 = n5.children[i8];
    s8.type === "element" && s8.tagName === "source" && s8.properties && (r7 = String(s8.properties.src || ""));
  }
  if (o5) {
    const s8 = { type: "image", title: null, url: t5.resolve(o5), alt: tn(a8) };
    t5.patch(n5, s8), a8 = [s8];
  }
  const c8 = a8, u8 = { type: "link", title: e3.title ? String(e3.title) : null, url: t5.resolve(r7), children: c8 };
  return t5.patch(n5, u8), u8;
}
function zt(t5, n5) {
  const e3 = t5.all(n5);
  if (e3.length > 0) {
    const o5 = { type: "paragraph", children: e3 };
    return t5.patch(n5, o5), o5;
  }
}
var ln = ['"'];
function an(t5, n5) {
  const e3 = t5.options.quotes || ln;
  t5.qNesting++;
  const o5 = t5.all(n5);
  t5.qNesting--;
  const r7 = e3[t5.qNesting % e3.length], i8 = o5[0], l8 = o5[o5.length - 1], a8 = r7.charAt(0), c8 = r7.length > 1 ? r7.charAt(1) : r7;
  return i8 && i8.type === "text" ? i8.value = a8 + i8.value : o5.unshift({ type: "text", value: a8 }), l8 && l8.type === "text" ? l8.value += c8 : o5.push({ type: "text", value: c8 }), o5;
}
function cn(t5, n5) {
  let e3 = t5.all(n5);
  (t5.options.document || q(e3)) && (e3 = qt(e3));
  const o5 = { type: "root", children: e3 };
  return t5.patch(n5, o5), o5;
}
function sn(t5, n5) {
  const e3 = Et(n5);
  let o5 = -1;
  const r7 = [];
  for (; ++o5 < e3.length; ) {
    const i8 = e3[o5];
    r7.push(i8[1] ? i8[1] + " (" + i8[0] + ")" : i8[0]);
  }
  if (r7.length > 0) {
    const i8 = { type: "text", value: r7.join(", ") };
    return t5.patch(n5, i8), i8;
  }
}
function Dt(t5, n5) {
  const e3 = { type: "strong", children: t5.all(n5) };
  return t5.patch(n5, e3), e3;
}
function Jt(t5, n5) {
  const e3 = { type: "tableCell", children: t5.all(n5) };
  if (t5.patch(n5, e3), n5.properties) {
    const o5 = n5.properties.rowSpan, r7 = n5.properties.colSpan;
    if (o5 || r7) {
      const i8 = e3.data || (e3.data = {});
      o5 && (i8.hastUtilToMdastTemporaryRowSpan = o5), r7 && (i8.hastUtilToMdastTemporaryColSpan = r7);
    }
  }
  return e3;
}
function un(t5, n5) {
  const e3 = { type: "tableRow", children: t5.toSpecificContent(t5.all(n5), pn) };
  return t5.patch(n5, e3), e3;
}
function pn() {
  return { type: "tableCell", children: [] };
}
function fn(t5, n5) {
  if (t5.inTable) {
    const u8 = { type: "text", value: I(n5) };
    return t5.patch(n5, u8), u8;
  }
  t5.inTable = true;
  const { align: e3, headless: o5 } = hn(n5), r7 = t5.toSpecificContent(t5.all(n5), Lt);
  o5 && r7.unshift(Lt());
  let i8 = -1;
  for (; ++i8 < r7.length; ) {
    const u8 = r7[i8], s8 = t5.toSpecificContent(u8.children, dn);
    u8.children = s8;
  }
  let l8 = 1;
  for (i8 = -1; ++i8 < r7.length; ) {
    const u8 = r7[i8].children;
    let s8 = -1;
    for (; ++s8 < u8.length; ) {
      const h4 = u8[s8];
      if (h4.data) {
        const d9 = h4.data, m4 = Number.parseInt(String(d9.hastUtilToMdastTemporaryColSpan), 10) || 1, b5 = Number.parseInt(String(d9.hastUtilToMdastTemporaryRowSpan), 10) || 1;
        if (m4 > 1 || b5 > 1) {
          let y6 = i8 - 1;
          for (; ++y6 < i8 + b5; ) {
            let x = s8 - 1;
            for (; ++x < s8 + m4 && r7[y6]; ) {
              const w2 = [];
              (y6 !== i8 || x !== s8) && w2.push({ type: "tableCell", children: [] }), r7[y6].children.splice(x, 0, ...w2);
            }
          }
        }
        "hastUtilToMdastTemporaryColSpan" in h4.data && delete h4.data.hastUtilToMdastTemporaryColSpan, "hastUtilToMdastTemporaryRowSpan" in h4.data && delete h4.data.hastUtilToMdastTemporaryRowSpan, Object.keys(h4.data).length === 0 && delete h4.data;
      }
    }
    u8.length > l8 && (l8 = u8.length);
  }
  for (i8 = -1; ++i8 < r7.length; ) {
    const u8 = r7[i8].children;
    let s8 = u8.length - 1;
    for (; ++s8 < l8; )
      u8.push({ type: "tableCell", children: [] });
  }
  let a8 = e3.length - 1;
  for (; ++a8 < l8; )
    e3.push(null);
  t5.inTable = false;
  const c8 = { type: "table", align: e3, children: r7 };
  return t5.patch(n5, c8), c8;
}
function hn(t5) {
  const n5 = { align: [null], headless: true };
  let e3 = 0, o5 = 0;
  return U(t5, function(r7) {
    if (r7.type === "element") {
      if (r7.tagName === "table" && t5 !== r7)
        return mt;
      if ((r7.tagName === "th" || r7.tagName === "td") && r7.properties) {
        if (!n5.align[o5]) {
          const i8 = String(r7.properties.align || "") || null;
          (i8 === "center" || i8 === "left" || i8 === "right" || i8 === null) && (n5.align[o5] = i8);
        }
        n5.headless && e3 < 2 && r7.tagName === "th" && (n5.headless = false), o5++;
      } else
        r7.tagName === "thead" ? n5.headless = false : r7.tagName === "tr" && (e3++, o5 = 0);
    }
  }), n5;
}
function dn() {
  return { type: "tableCell", children: [] };
}
function Lt() {
  return { type: "tableRow", children: [] };
}
function gn(t5, n5) {
  const e3 = { type: "text", value: n5.value };
  return t5.patch(n5, e3), e3;
}
function mn(t5, n5) {
  const e3 = { type: "text", value: I(n5) };
  return t5.patch(n5, e3), e3;
}
function yn(t5, n5) {
  const e3 = { type: "text", value: "\u200B" };
  return t5.patch(n5, e3), e3;
}
var Vt = { comment: Pe, doctype: f3, root: cn, text: gn };
var X = { applet: f3, area: f3, basefont: f3, bgsound: f3, caption: f3, col: f3, colgroup: f3, command: f3, content: f3, datalist: f3, dialog: f3, element: f3, embed: f3, frame: f3, frameset: f3, isindex: f3, keygen: f3, link: f3, math: f3, menu: f3, menuitem: f3, meta: f3, nextid: f3, noembed: f3, noframes: f3, optgroup: f3, option: f3, param: f3, script: f3, shadow: f3, source: f3, spacer: f3, style: f3, svg: f3, template: f3, title: f3, track: f3, abbr: p4, acronym: p4, bdi: p4, bdo: p4, big: p4, blink: p4, button: p4, canvas: p4, cite: p4, data: p4, details: p4, dfn: p4, font: p4, ins: p4, label: p4, map: p4, marquee: p4, meter: p4, nobr: p4, noscript: p4, object: p4, output: p4, progress: p4, rb: p4, rbc: p4, rp: p4, rt: p4, rtc: p4, ruby: p4, slot: p4, small: p4, span: p4, sup: p4, sub: p4, tbody: p4, tfoot: p4, thead: p4, time: p4, address: g3, article: g3, aside: g3, body: g3, center: g3, div: g3, fieldset: g3, figcaption: g3, figure: g3, form: g3, footer: g3, header: g3, hgroup: g3, html: g3, legend: g3, main: g3, multicol: g3, nav: g3, picture: g3, section: g3, a: Ae, audio: Ht, b: Dt, base: Ie, blockquote: Te, br: je, code: T, dir: K, dl: He, dt: G, dd: G, del: _3, em: R, h1: S, h2: S, h3: S, h4: S, h5: S, h6: S, hr: De, i: R, iframe: Je, img: jt, image: jt, input: We, kbd: T, li: G, listing: O, mark: R, ol: K, p: zt, plaintext: O, pre: O, q: an, s: _3, samp: T, select: sn, strike: _3, strong: Dt, summary: zt, table: fn, td: Jt, textarea: mn, th: Jt, tr: un, tt: T, u: R, ul: K, var: T, video: Ht, wbr: yn, xmp: O };
function p4(t5, n5) {
  return t5.all(n5);
}
function g3(t5, n5) {
  return t5.toFlow(t5.all(n5));
}
function f3() {
}
var Wt = {}.hasOwnProperty;
function bn(t5) {
  return { all: vn, baseFound: false, elementById: /* @__PURE__ */ new Map(), frozenBaseUrl: void 0, handlers: { ...X, ...t5.handlers }, inTable: false, nodeHandlers: { ...Vt, ...t5.nodeHandlers }, one: wn, options: t5, patch: xn, qNesting: 0, resolve: Nn, toFlow: Sn, toSpecificContent: kn };
}
function vn(t5) {
  const n5 = t5.children || [], e3 = [];
  let o5 = -1;
  for (; ++o5 < n5.length; ) {
    const l8 = n5[o5], a8 = this.one(l8, t5);
    Array.isArray(a8) ? e3.push(...a8) : a8 && e3.push(a8);
  }
  let r7 = 0, i8 = e3.length;
  for (; r7 < i8 && e3[r7].type === "break"; )
    r7++;
  for (; i8 > r7 && e3[i8 - 1].type === "break"; )
    i8--;
  return r7 === 0 && i8 === e3.length ? e3 : e3.slice(r7, i8);
}
function wn(t5, n5) {
  if (t5.type === "element") {
    if (t5.properties && t5.properties.dataMdast === "ignore")
      return;
    if (Wt.call(this.handlers, t5.tagName))
      return this.handlers[t5.tagName](this, t5, n5) || void 0;
  } else if (Wt.call(this.nodeHandlers, t5.type))
    return this.nodeHandlers[t5.type](this, t5, n5) || void 0;
  if ("value" in t5 && typeof t5.value == "string") {
    const e3 = { type: "text", value: t5.value };
    return this.patch(t5, e3), e3;
  }
  if ("children" in t5)
    return this.all(t5);
}
function xn(t5, n5) {
  t5.position && (n5.position = ke(t5));
}
function Nn(t5) {
  const n5 = this.frozenBaseUrl;
  return t5 == null ? "" : n5 ? String(new URL(t5, n5)) : t5;
}
function Sn(t5) {
  return qt(t5);
}
function kn(t5, n5) {
  const e3 = n5(), o5 = [];
  let r7 = [], i8 = -1;
  for (; ++i8 < t5.length; ) {
    const a8 = t5[i8];
    if (l8(a8))
      r7.length > 0 && (a8.children.unshift(...r7), r7 = []), o5.push(a8);
    else {
      const c8 = a8;
      r7.push(c8);
    }
  }
  if (r7.length > 0) {
    let a8 = o5[o5.length - 1];
    a8 || (a8 = n5(), o5.push(a8)), a8.children.push(...r7), r7 = [];
  }
  return o5;
  function l8(a8) {
    return a8.type === e3.type;
  }
}
var An = {};
function In(t5, n5) {
  const e3 = it(t5), o5 = n5 || An, r7 = ue({ newlines: o5.newlines === true }), i8 = bn(o5);
  let l8;
  r7(e3), U(e3, function(c8) {
    if (c8 && c8.type === "element" && c8.properties) {
      const u8 = String(c8.properties.id || "") || void 0;
      u8 && !i8.elementById.has(u8) && i8.elementById.set(u8, c8);
    }
  });
  const a8 = i8.one(e3, void 0);
  return a8 ? Array.isArray(a8) ? l8 = { type: "root", children: a8 } : l8 = a8 : l8 = { type: "root", children: [] }, U(l8, function(c8, u8, s8) {
    if (c8.type === "text" && u8 !== void 0 && s8) {
      const h4 = s8.children[u8 - 1];
      if (h4 && h4.type === c8.type)
        return h4.value += c8.value, s8.children.splice(u8, 1), h4.position && c8.position && (h4.position.end = c8.position.end), u8 - 1;
      if (c8.value = c8.value.replace(/[\t ]*(\r?\n|\r)[\t ]*/, "$1"), s8 && (s8.type === "heading" || s8.type === "paragraph" || s8.type === "root") && (u8 || (c8.value = c8.value.replace(/^[\t ]+/, "")), u8 === s8.children.length - 1 && (c8.value = c8.value.replace(/[\t ]+$/, ""))), !c8.value)
        return s8.children.splice(u8, 1), u8;
    }
  }), l8;
}
var Tn = X.li;
var jn = X.textarea;
var En = Vt.root;

// node_modules/jsx-slack/module/src/mrkdwn/parser.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/vendor/htm/mini/index.mjs
init_checked_fetch();
init_modules_watch_stub();
function j3(m4) {
  for (var p8, d9, i8 = arguments, s8 = 1, e3 = "", v5 = "", g6 = [0], f7 = function(u8) {
    s8 === 1 && (u8 || (e3 = e3.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? g6.push(u8 ? i8[u8] : e3) : s8 === 3 && (u8 || e3) ? (g6[1] = u8 ? i8[u8] : e3, s8 = 2) : s8 === 2 && e3 === "..." && u8 ? g6[2] = Object.assign(g6[2] || {}, i8[u8]) : s8 === 2 && e3 && !u8 ? (g6[2] = g6[2] || {})[e3] = true : s8 >= 5 && (s8 === 5 ? ((g6[2] = g6[2] || {})[d9] = u8 ? e3 ? e3 + i8[u8] : i8[u8] : e3, s8 = 6) : (u8 || e3) && (g6[2][d9] += u8 ? e3 + i8[u8] : e3)), e3 = "";
  }, o5 = 0; o5 < m4.length; o5++) {
    o5 && (s8 === 1 && f7(), f7(o5));
    for (var b5 = 0; b5 < m4[o5].length; b5++)
      p8 = m4[o5][b5], s8 === 1 ? p8 === "<" ? (f7(), g6 = [g6, "", null], s8 = 3) : e3 += p8 : s8 === 4 ? e3 === "--" && p8 === ">" ? (s8 = 1, e3 = "") : e3 = p8 + e3[0] : v5 ? p8 === v5 ? v5 = "" : e3 += p8 : p8 === '"' || p8 === "'" ? v5 = p8 : p8 === ">" ? (f7(), s8 = 1) : s8 && (p8 === "=" ? (s8 = 5, d9 = e3, e3 = "") : p8 === "/" && (s8 < 5 || m4[o5][b5 + 1] === ">") ? (f7(), s8 === 3 && (g6 = g6[0]), s8 = g6, (g6 = g6[0]).push(this.apply(null, s8.slice(1))), s8 = 0) : p8 === " " || p8 === "	" || p8 === `
` || p8 === "\r" ? (f7(), s8 = 2) : e3 += p8), s8 === 3 && e3 === "!--" && (s8 = 4, g6 = g6[0]);
  }
  return f7(), g6.length > 2 ? g6.slice(1) : g6[1];
}

// node_modules/jsx-slack/module/src/mrkdwn/parser.mjs
var s6 = (t5) => t5.replace(/&/g, "&amp;").replace(/(?![\t\n\r ])\s/g, (e3) => `&#${e3.codePointAt(0)};`);
var d7 = j3.bind((t5, e3, ...p8) => {
  const r7 = { tagName: t5, type: "element", properties: {}, children: [] };
  for (const o5 of e3 ? Object.keys(e3) : [])
    r7.properties[o5] = m2(e3[o5]);
  for (const o5 of p8) {
    const n5 = m2(o5);
    r7.children.push(typeof n5 == "string" ? { value: s6(n5), type: "text" } : n5);
  }
  return r7;
});
function a5(t5) {
  const { children: e3 } = d7([`<body>${t5}</body>`]);
  return { type: "root", children: e3 };
}

// node_modules/jsx-slack/module/src/mrkdwn/stringifier.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/mrkdwn/measure.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/data/font-width.json.mjs
init_checked_fetch();
init_modules_watch_stub();
var s7 = { 0: 58, 1: 58, 2: 58, 3: 58, 4: 58, 5: 58, 6: 58, 7: 58, 8: 58, 9: 58, a: 49.69999694824219, b: 56, c: 47.75, d: 56, e: 52.79998779296875, f: 35.04998779296875, g: 52, h: 55.79998779296875, i: 24, j: 24, k: 50.79998779296875, l: 23.599990844726562, m: 82.25, n: 55.79998779296875, o: 56.69999694824219, p: 56.04998779296875, q: 56, r: 36.399993896484375, s: 43.29998779296875, t: 35.84999084472656, u: 55.75, v: 51.59999084472656, w: 78.55000305175781, x: 49.79998779296875, y: 51.54998779296875, z: 45.19999694824219, A: 67.69999694824219, B: 64.64999389648438, C: 66.80000305175781, D: 76.05000305175781, E: 57.75, F: 56.54998779296875, G: 73.05000305175781, H: 76.34999084472656, I: 28, J: 42.25, K: 66.25, L: 51.34999084472656, M: 92.84999084472656, N: 76.34999084472656, O: 80.05000305175781, P: 60.04998779296875, Q: 80.05000305175781, R: 62.649993896484375, S: 54.25, T: 59.04998779296875, U: 73.55000305175781, V: 67.69999694824219, W: 103.55000305175781, X: 64.89999389648438, Y: 62.399993896484375, Z: 60.19999694824219, "-": 37.149993896484375, ".": 23.599990844726562, "\u2022": 58, "\u25E6": 40.44999694824219, "\u25AA": 40.44999694824219 };
var t3 = { "\u2002": 50, "\u2003": 75, "\u2004": 33.29998779296875, "\u2005": 25, "\u2006": 16.649993896484375, "\u2007": 58, "\u2008": 21.25, "\u2009": 12.5, "\u200A": 6.25 };

// node_modules/jsx-slack/module/src/mrkdwn/measure.mjs
var i6 = Object.keys(t3).reduce((t5, e3) => ({ ...t5, [t3[e3]]: e3 }), {});
var l6 = Object.values(t3).sort((t5, e3) => e3 - t5);
var a6 = /* @__PURE__ */ new Map();
var u5 = /* @__PURE__ */ new Map();
function d8(t5) {
  let e3 = a6.get(t5);
  if (e3 === void 0) {
    e3 = "";
    let o5 = t5;
    l6.forEach((r7) => {
      const n5 = Math.floor(o5 / r7);
      n5 > 0 && (e3 += i6[r7].repeat(n5)), o5 -= r7 * n5;
    }), a6.set(t5, e3);
  }
  return e3;
}
function f4(t5) {
  let e3 = u5.get(t5);
  return e3 === void 0 && (e3 = [...t5].reduce((o5, r7) => {
    var n5;
    return o5 + ((n5 = s7[r7]) != null ? n5 : 25.6);
  }, 0), u5.set(t5, e3)), e3;
}

// node_modules/jsx-slack/module/vendor/unist-util-parents/lib/index.mjs
init_checked_fetch();
init_modules_watch_stub();
var u6 = /* @__PURE__ */ new WeakMap();
function b3(e3) {
  return f5(e3, void 0);
}
function f5(e3, n5) {
  const i8 = u6.get(e3);
  if (i8)
    return i8;
  const r7 = {};
  let t5;
  for (t5 in e3)
    t5 !== "children" && (r7[t5] = e3[t5]);
  return Object.defineProperty(r7, "node", { writable: true, configurable: true, value: e3 }), Object.defineProperty(r7, "parent", { configurable: true, get: o5, set: a8 }), "children" in e3 && Object.defineProperty(r7, "children", { enumerable: true, configurable: true, get: l8 }), u6.set(e3, r7), r7;
  function o5() {
    return n5;
  }
  function a8(c8) {
    n5 = c8;
  }
  function l8() {
    return e3.children.map(function(p8) {
      return f5(p8, r7);
    });
  }
}

// node_modules/jsx-slack/module/vendor/mdast-util-phrasing/lib/index.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/vendor/unist-util-is/lib/index.mjs
init_checked_fetch();
init_modules_watch_stub();
var i7 = function(n5) {
  if (n5 == null)
    return p5;
  if (typeof n5 == "function")
    return c7(n5);
  if (typeof n5 == "object")
    return Array.isArray(n5) ? f6(n5) : y5(n5);
  if (typeof n5 == "string")
    return l7(n5);
  throw new Error("Expected function, string, or object as test");
};
function f6(n5) {
  const e3 = [];
  let r7 = -1;
  for (; ++r7 < n5.length; )
    e3[r7] = i7(n5[r7]);
  return c7(t5);
  function t5(...u8) {
    let o5 = -1;
    for (; ++o5 < e3.length; )
      if (e3[o5].apply(this, u8))
        return true;
    return false;
  }
}
function y5(n5) {
  const e3 = n5;
  return c7(r7);
  function r7(t5) {
    const u8 = t5;
    let o5;
    for (o5 in n5)
      if (u8[o5] !== e3[o5])
        return false;
    return true;
  }
}
function l7(n5) {
  return c7(e3);
  function e3(r7) {
    return r7 && r7.type === n5;
  }
}
function c7(n5) {
  return e3;
  function e3(r7, t5, u8) {
    return !!(a7(r7) && n5.call(this, r7, typeof t5 == "number" ? t5 : void 0, u8 || void 0));
  }
}
function p5() {
  return true;
}
function a7(n5) {
  return n5 !== null && typeof n5 == "object" && "type" in n5;
}

// node_modules/jsx-slack/module/vendor/mdast-util-phrasing/lib/index.mjs
var n3 = i7(["break", "delete", "emphasis", "footnote", "footnoteReference", "image", "imageReference", "inlineCode", "link", "linkReference", "strong", "text"]);

// node_modules/jsx-slack/module/src/mrkdwn/stringifier.mjs
var k3 = ["\u2022", "\u25E6", "\u25AA\uFE0E"];
var M2 = (n5) => {
  var c8;
  return !((c8 = n5.data) != null && c8.codeBlock) && n3(n5);
};
var $3 = class {
  constructor(c8) {
    this.codes = [], this.lists = [], this.visitors = { root: (e3) => this.renderCodeBlock(this.block(e3)), text: (e3) => {
      var t5, i8;
      if ((t5 = e3.data) != null && t5.time)
        return this.visitors.time(e3);
      if ((i8 = e3.data) != null && i8.escape) {
        let s8 = e3;
        for (; s8 = s8.parent; )
          if (s8.type === "link")
            return this.escape(e3.data.escape);
        return `<!date^00000000^{_}|${e3.value}>`;
      }
      return this.escape(e3.value);
    }, paragraph: (e3) => this.block(e3), blockquote: (e3) => [...this.block(e3).split(`
`), ""].map((t5) => `&gt; ${t5}`).join(`
`), emphasis: (e3) => this.markup("_", this.block(e3)), strong: (e3) => this.markup("*", this.block(e3)), delete: (e3) => this.markup("~", this.block(e3), { skipCodeBlock: true }), inlineCode: (e3) => {
      var t5;
      return (t5 = e3.data) != null && t5.codeBlock ? this.visitors.code(e3) : this.markup("`", this.block(e3));
    }, code: (e3) => {
      const t5 = this.codes.length;
      return this.codes.push(this.block(e3)), `<<code:${t5}>>`;
    }, link: (e3) => {
      if (!e3.url)
        return this.block(e3);
      switch (s2(e3.url)) {
        case "#C":
        case "@UW":
          return `<${e3.url}>`;
        case "@S":
          return `<!subteam^${e3.url.slice(1)}>`;
        case "@channel":
          return "<!channel|channel>";
        case "@everyone":
          return "<!everyone|everyone>";
        case "@here":
          return "<!here|here>";
        default: {
          const t5 = this.renderCodeBlock(this.block(e3).replace(/\n+/g, " "), { singleLine: true }), i8 = t5.match(/^(<!date\^(?!0{8}).+)\|(.+>)$/);
          if (i8) {
            const s8 = i5(e3.url).replace(/\^+/g, encodeURI);
            return `${i8[1]}^${s8}|${i8[2]}`;
          }
          return e3.url === m2(t5) && !t5.includes("|") ? `<${t5}>` : `<${i5(e3.url)}|${t5}>`;
        }
      }
    }, list: (e3) => {
      this.lists.unshift([Math.floor(e3.start - 1) || 0, []]);
      const t5 = this.block(e3), [, i8] = this.lists.shift();
      let s8;
      if (e3.ordered)
        s8 = new Map(i8.map((r7) => [r7, `${(() => e3.orderedType === "a" ? c4(r7) : e3.orderedType === "A" ? c4(r7).toUpperCase() : e3.orderedType === "i" ? g(r7) : e3.orderedType === "I" ? g(r7).toUpperCase() : r7.toString())()}.`]));
      else {
        const r7 = k3[Math.min(this.lists.length, k3.length - 1)];
        s8 = new Map(i8.map((o5) => [o5, r7]));
      }
      const a8 = Math.max(...[...s8.values()].map(f4));
      return t5.replace(/<<l(-?\d+)>>/g, (r7, o5) => {
        const l8 = s8.get(Number.parseInt(o5, 10)), g6 = f4(l8);
        return `${d8(a8 - g6)}${l8} `;
      }).replace(/<<ls>>/g, `${d8(a8)} `);
    }, listItem: (e3) => {
      var t5, i8;
      let s8 = "s";
      return (t5 = e3.data) != null && t5.implied || ((i8 = e3.data) != null && i8.value ? this.lists[0][0] = e3.data.value : this.lists[0][0] += 1, this.lists[0][1].push(this.lists[0][0]), s8 = this.lists[0][0].toString()), this.block(e3).split(`
`).map((a8, r7) => `<<l${r7 > 0 ? "s" : s8}>>${a8}`).join(`
`);
    }, time: (e3) => {
      const t5 = this.escape(e3.data.time.datetime), i8 = this.escape(e3.value.replace(/\n+/g, " ")), s8 = this.escape(e3.data.time.fallback);
      return `<!date^${t5}^${i8}|${s8}>`;
    }, break: () => `
` }, this.block = (e3) => {
      var t5, i8;
      const s8 = [];
      let a8;
      for (const r7 of e3.children)
        a8 && ((t5 = a8.data) != null && t5.codeBlock && s8.push(`
`), M2(r7) || ((i8 = s8[s8.length - 1]) != null && i8.endsWith(`
`) || s8.push(`
`), !(r7.type === "list" && this.lists.length > 0) && ["paragraph", "blockquote", "list"].includes(a8.type) && s8.push(`
`))), s8.push(this.visit(r7, e3)), a8 = r7;
      return s8.join("");
    }, this.escape = s5, this.markup = (e3, t5, { skipCodeBlock: i8 = false } = {}) => {
      const s8 = a.exactMode() ? `\u200B${e3}\u200B` : e3;
      return t5.split(`
`).map((a8) => a8.replace(/^((?:&gt; )*)(.*)$/, (r7, o5, l8) => l8 && !(i8 && l8.startsWith("<<code:")) ? `${o5}${s8}${l8}${s8}` : `${o5}${l8}`)).join(`
`);
    }, this.renderCodeBlock = (e3, { singleLine: t5 = false } = {}) => e3.replace(/<<code:(\d+)>>/g, (i8, s8) => {
      const a8 = this.codes[Number.parseInt(s8, 10)];
      return t5 ? `\`\`\`${a8.replace(/\n+/g, " ")}\`\`\`` : `\`\`\`
${a8}
\`\`\``;
    }), this.visit = (e3, t5) => this.visitors[e3.type](e3, t5), this.root = b3(c8);
  }
  compile() {
    return this.codes = [], this.lists = [], this.visit(this.root);
  }
};
function I2(n5) {
  return new $3(n5).compile();
}

// node_modules/jsx-slack/module/vendor/unist-util-visit/lib/index.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/vendor/unist-util-visit-parents/lib/index.mjs
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/vendor/unist-util-visit-parents/lib/color.mjs
init_checked_fetch();
init_modules_watch_stub();
function r4(o5) {
  return o5;
}

// node_modules/jsx-slack/module/vendor/unist-util-visit-parents/lib/index.mjs
var g4 = [];
var b4 = true;
var p6 = false;
var N2 = "skip";
function E2(t5, o5, u8, s8) {
  let y6;
  typeof o5 == "function" && typeof u8 != "function" ? (s8 = u8, u8 = o5) : y6 = o5;
  const P2 = i7(y6), m4 = s8 ? -1 : 1;
  h4(t5, void 0, [])();
  function h4(n5, A2, l8) {
    const i8 = n5 && typeof n5 == "object" ? n5 : {};
    if (typeof i8.type == "string") {
      const e3 = typeof i8.tagName == "string" ? i8.tagName : typeof i8.name == "string" ? i8.name : void 0;
      Object.defineProperty(d9, "name", { value: "node (" + r4(n5.type + (e3 ? "<" + e3 + ">" : "")) + ")" });
    }
    return d9;
    function d9() {
      let e3 = g4, f7, r7, a8;
      if ((!o5 || P2(n5, A2, l8[l8.length - 1] || void 0)) && (e3 = O2(u8(n5, l8)), e3[0] === p6))
        return e3;
      if ("children" in n5 && n5.children) {
        const c8 = n5;
        if (c8.children && e3[0] !== N2)
          for (r7 = (s8 ? c8.children.length : -1) + m4, a8 = l8.concat(c8); r7 > -1 && r7 < c8.children.length; ) {
            const I3 = c8.children[r7];
            if (f7 = h4(I3, r7, a8)(), f7[0] === p6)
              return f7;
            r7 = typeof f7[1] == "number" ? f7[1] : r7 + m4;
          }
      }
      return e3;
    }
  }
}
function O2(t5) {
  return Array.isArray(t5) ? t5 : typeof t5 == "number" ? [b4, t5] : t5 == null ? g4 : [t5];
}

// node_modules/jsx-slack/module/vendor/unist-util-visit/lib/index.mjs
function r5(l8, n5, e3, u8) {
  let t5, f7, o5;
  typeof n5 == "function" && typeof e3 != "function" ? (f7 = void 0, o5 = n5, t5 = e3) : (f7 = n5, o5 = e3, t5 = u8), E2(l8, f7, p8, t5);
  function p8(c8, d9) {
    const i8 = d9[d9.length - 1], x = i8 ? i8.children.indexOf(c8) : void 0;
    return o5(c8, x, i8);
  }
}

// node_modules/jsx-slack/module/src/mrkdwn/index.mjs
var m3 = (o5, e3) => {
  var t5, r7;
  const a8 = e3.tagName === "ol", l8 = a8 ? (t5 = e3.properties.type) != null ? t5 : "1" : null, s8 = a8 ? Number.parseInt((r7 = e3.properties.start) != null ? r7 : 1, 10) : null;
  let i8 = o5.handlers.span(o5, e3, void 0);
  i8 && (i8 = [].concat(i8).map((n5) => n5.type !== "listItem" ? { type: "listItem", data: { implied: true }, children: [n5] } : n5));
  const d9 = { type: "list", ordered: a8, orderedType: l8, start: s8, children: i8 };
  return o5.patch(e3, d9), d9;
};
var N3 = (...o5) => {
  const e3 = In(...o5);
  return r5(e3, (t5) => {
    t5.type.startsWith("text-jsxslack-") && (t5.type = "text");
  }), e3;
};
var T2 = (o5) => I2(N3(a5(o5), { document: false, nodeHandlers: { root: (e3, t5) => {
  r5(t5, (s8) => {
    s8.type === "text" && (s8.value = m2(s8.value));
  });
  const r7 = En(e3, t5), a8 = (() => r7 ? Array.isArray(r7) ? { type: "root", children: r7 } : r7 : { type: "root", children: [] })();
  let l8 = 0;
  return r5(a8, "text", (s8) => {
    s8.type = "text-jsxslack-" + l8, l8 += 1;
  }), r7;
} }, handlers: { code: (e3, t5, r7) => ({ ...t5, type: "inlineCode", children: e3.handlers.span(e3, t5, r7) }), pre: (e3, t5, r7) => ({ ...t5, type: "inlineCode", children: e3.handlers.span(e3, t5, r7), data: { codeBlock: true } }), time: (e3, t5) => {
  var r7, a8;
  return { ...jn(e3, t5), data: { time: { datetime: (r7 = t5.properties) == null ? void 0 : r7.datetime, fallback: (a8 = t5.properties) == null ? void 0 : a8["data-fallback"] } } };
}, ul: m3, ol: m3, li: (e3, t5) => {
  var r7;
  const a8 = Tn(e3, t5), l8 = Number.parseInt((r7 = t5.properties) == null ? void 0 : r7.value, 10);
  return !Number.isNaN(l8) && a8 && (a8.data = { value: l8 }), a8;
}, span: (e3, t5) => {
  var r7;
  return (r7 = t5.properties) != null && r7["data-escape"] ? { ...jn(e3, t5), data: { escape: t5.properties["data-escape"] } } : e3.all(t5);
} } }));
var k4 = (o5) => T2(b2(o5, []).join(""));

// node_modules/jsx-slack/module/src/block-kit/composition/Mrkdwn.mjs
var $4 = { verbatim: true };
var n4 = p("Mrkdwn", (r7) => ({ type: "mrkdwn", text: r7.raw ? a3(r7.children).text : k4(r7.children), verbatim: r7.verbatim }));
var o4 = (r7, l8 = $4, i8 = false) => {
  const [e3] = a.Children.toArray(r7);
  return b(e3, n4) ? i8 ? h(n4, { ...e3.$$jsxslack.props || {}, children: e3.$$jsxslack.children }) : e3 : j(h(n4, { ...l8, children: r7 }));
};

// node_modules/jsx-slack/module/src/block-kit/layout/Section.mjs
var h3 = Symbol("jsx-slack-field");
var p7 = { button: () => {
}, channels_select: (t5) => {
  if (t5.response_url_enabled)
    throw new l2("<ChannelsSelect responseUrlEnabled> is available only in the usage of input components.", t5);
}, checkboxes: () => {
}, conversations_select: (t5) => {
  if (t5.response_url_enabled)
    throw new l2("<ConversationsSelect responseUrlEnabled> is available only in the usage of input components.", t5);
}, datepicker: () => {
}, external_select: () => {
}, image: ({ type: t5, image_url: a8, alt_text: m4 }) => ({ type: t5, image_url: a8, alt_text: m4 }), multi_channels_select: () => {
}, multi_conversations_select: () => {
}, multi_external_select: () => {
}, multi_static_select: () => {
}, multi_users_select: () => {
}, overflow: () => {
}, radio_buttons: () => {
}, static_select: () => {
}, timepicker: () => {
}, users_select: () => {
}, workflow_button: () => {
}, input: l3("Section") };
var E3 = Object.keys(p7);
var C2 = p("Field", ({ children: t5 }) => Object.defineProperty(o4(t5), h3, { value: true }));
var F2 = p("Section", ({ blockId: t5, children: a8, id: m4, ...g6 }) => {
  let l8, s8, o5;
  const k5 = a.Children.toArray(a8).reduce((r7, e3) => {
    if (a.isValidElement(e3)) {
      const { type: i8 } = e3.$$jsxslack, u8 = e3.$$jsxslack.props || {};
      if (i8 === "img")
        return s8 = l(e3, { type: "image", image_url: u8.src, alt_text: u8.alt }), r7;
      if (i8 === "button")
        return s8 = c2(e3, t2), r7;
      if (i8 === "select")
        return s8 = c2(e3, i3), r7;
      if (typeof i8 != "string" && typeof e3 == "object") {
        const n5 = e3;
        if (n5[h3])
          o5 = [...o5 || [], n5];
        else if (n5.type === "mrkdwn" && n5.text)
          l8 = n5;
        else if (p7[n5.type])
          s8 = p7[n5.type](n5) || n5;
        else {
          if (i8 === y4)
            return [...r7, e3];
          {
            const f7 = i2(e3);
            throw new l2(`<Section> has detected the unexpected component as an accessory${f7 ? `: ${f7}` : "."}`, e3);
          }
        }
        return r7;
      }
    }
    return [...r7, e3];
  }, []);
  if (!l8) {
    const r7 = o4(k5);
    r7.text && (l8 = r7);
  }
  if (o5 && o5.length > 10)
    throw new l2(`<Section> can contain up to 10 fields, but there are ${o5.length} fields.`, g6.__source);
  return { type: "section", block_id: t5 || m4, text: l8, accessory: s8, fields: o5 };
});

// node_modules/jsx-slack/module/src/block-kit/layout/Video.mjs
init_checked_fetch();
init_modules_watch_stub();
var t4 = p("Video", (r7) => ({ type: "video", block_id: r7.blockId || r7.id, video_url: r7.videoUrl || r7.src, alt_text: r7.alt, thumbnail_url: r7.thumbnailUrl || r7.poster, title: a3(r7.title), title_url: r7.titleUrl, author_name: r7.authorName, provider_name: r7.providerName, provider_icon_url: r7.providerIconUrl, description: r7.description != null ? a3(r7.description) : void 0 }));

// node_modules/jsx-slack/module/src/block-kit/container/utils.mjs
init_checked_fetch();
init_modules_watch_stub();
var u7 = ({ aliases: n5, availableBlockTypes: i8, typesToCheckMissingLabel: t5, name: e3 }) => p(e3, ({ children: c8 }) => a.Children.toArray(c8).reduce((m4, o5) => {
  const d9 = i2(o5), r7 = a.isValidElement(o5) && typeof o5.$$jsxslack.type == "string" && n5[o5.$$jsxslack.type] && c2(o5, n5[o5.$$jsxslack.type]) || o5;
  if (typeof r7 == "object" && r7) {
    const a8 = r7, l8 = i8[a8.type];
    if (l8)
      return typeof l8 == "function" && l8(a8), [...m4, a8];
    let s8 = "";
    throw d9 && (s8 = `Provided by ${d9}`, (t5 || []).includes(a8.type) && (s8 += '. Are you missing the definition of "label" prop to use the input component?')), new l2(`<${e3}> has detected an invalid block type as the layout block: "${a8.type}"${s8 ? ` (${s8})` : ""}`, o5);
  }
  return m4;
}, []));
var v4 = (n5 = [..._]) => (i8) => {
  const t5 = (i8.elements || []).find(({ type: e3 }) => !n5.includes(e3));
  if (t5) {
    const e3 = i2(t5);
    throw new l2(`<Actions> block has detected an incompatible element with the root container${e3 ? `: ${e3}` : "."}`, t5);
  }
};
var w = (n5 = E3) => (i8) => {
  var t5;
  const e3 = (t5 = i8.accessory) == null ? void 0 : t5.type;
  if (e3 && !n5.includes(e3)) {
    const c8 = i2(i8.accessory);
    throw new l2(`<Section> block has detected an incompatible accessory with the root container${c8 ? `: ${c8}` : "."}`, i8.accessory);
  }
};

// node_modules/jsx-slack/module/src/block-kit/container/Blocks.mjs
var g5 = u7({ name: "Blocks", availableBlockTypes: { actions: v4([..._]), call: true, context: true, divider: true, file: true, header: true, image: true, input: true, section: w(E3), video: true }, aliases: { header: d5, hr: d4, img: r2, input: s4, section: F2, select: i3, textarea: e2, video: t4 }, typesToCheckMissingLabel: p2 });

// src/slack/views/jpi.tsx
init_checked_fetch();
init_modules_watch_stub();

// node_modules/jsx-slack/module/src/jsx-runtime.mjs
init_checked_fetch();
init_modules_watch_stub();
var r6 = (e3, a8, t5) => h(e3 != null ? e3 : u, { ...a8, ...t5 !== void 0 ? { key: t5 } : {} });

// src/slack/views/jpi.tsx
var jpiBlocks = ({ text, url }) => /* @__PURE__ */ r6(g5, { children: /* @__PURE__ */ r6(r2, { src: url, alt: text, title: text }) });

// src/slack/jpi.ts
function jpi(app, search) {
  let pattern = /^!jpi\s(.*)/;
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload)) {
      const match = payload.text.match(pattern);
      if (match && match[1]) {
        console.log("jpi:", match[1]);
        const urls2 = await search.image_urls(match[1]);
        if (urls2.length === 0) {
          await context.say({
            text: "\u305D\u3093\u306A\u753B\u50CF\u306F\u306A\u3044\u30D1\u30AB"
          });
        } else {
          await context.say({
            text: match[1],
            blocks: a(jpiBlocks({ text: match[1], url: urls2[Math.floor(Math.random() * urls2.length)] })),
            link_names: false
          });
        }
      }
    }
  });
}

// src/openai/completions.ts
init_checked_fetch();
init_modules_watch_stub();
var OpenAI = class {
  env;
  constructor(env) {
    this.env = env;
  }
  async completions(prompt) {
    const url = `https://api.openai.com/v1/chat/completions`;
    const request = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "\u3042\u306A\u305F\u306F\u30C1\u30E3\u30C3\u30C8\u30DC\u30C3\u30C8\u3067\u3059\u3002\u77ED\u3044\u8FD4\u7B54\u304C\u671B\u307E\u3057\u3044\u3067\u3059\u3002\u307E\u305F\u3001\u7279\u306B\u6307\u793A\u304C\u7121\u3044\u5834\u5408\u306F\u65E5\u672C\u8A9E\u3067\u5FDC\u7B54\u3057\u3066\u304F\u3060\u3055\u3044"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      top_p: 1,
      max_tokens: 300,
      presence_penalty: 1
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(request)
    });
    const result = await response.json();
    return result.choices[0].message.content.trim();
  }
};

// src/slack/chat.ts
init_checked_fetch();
init_modules_watch_stub();
function chat(app, openai) {
  let pattern = /^!chat\s(.*)/;
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload)) {
      const match = payload.text.match(pattern);
      if (match && match[1]) {
        console.log("chat: ", match[1]);
        const message = await openai.completions(match[1]);
        await context.say({
          text: `>${match[1]}
${message}`
        });
      }
    }
  });
}

// src/slack/keshite.ts
init_checked_fetch();
init_modules_watch_stub();
function keshite(app) {
  const pattern = /消して\s(.+)/;
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload) && DirectMention(context, payload)) {
      const match = payload.text.match(pattern);
      if (match && match[1]) {
        console.log("keshite: ", match[1]);
        const parsed = parse(match[1]);
        if (parsed) {
          await context.client.chat.delete(parsed);
        }
      }
    }
  });
}
function parse(url) {
  const pattern = /https:\/\/[\w-]+\.slack\.com\/archives\/([\w-]+)\/p(\d+)/;
  let match = url.match(pattern);
  if (match) {
    const channel = match[1];
    const index = match[2].length - 6;
    const ts = `${match[2].slice(0, index)}.${match[2].slice(index)}`;
    return { channel, ts };
  }
  return null;
}

// src/slack/ping.ts
init_checked_fetch();
init_modules_watch_stub();
function ping(app) {
  let pattern = /ping/;
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload) && DirectMention(context, payload)) {
      await context.say({
        text: `pong`
      });
    }
  });
}

// src/index.ts
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const googleImage = new GoogleImageSearch(env);
    if (url.pathname === "/jpi/img") {
      return handleJpiImage(request, googleImage);
    }
    const app = new import_slack_cloudflare_workers.SlackOAuthApp({
      env,
      installationStore: new import_slack_cloudflare_workers.KVInstallationStore(env, env.SLACK_INSTALLATIONS),
      stateStore: new import_slack_cloudflare_workers.KVStateStore(env.SLACK_OAUTH_STATES),
      oidc: {
        callback: async (args) => {
          const handler = import_slack_cloudflare_workers.defaultOpenIDConnectCallback;
          return await handler(args);
        }
      }
    });
    const openai = new OpenAI(env);
    keshite(app);
    erande(app);
    jpi(app, googleImage);
    chat(app, openai);
    ping(app);
    app.event("message", async ({}) => {
    });
    return await app.run(request, ctx);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e3) {
      console.error("Failed to drain the unused request body.", e3);
    }
  }
};
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e3) {
  return {
    name: e3?.name,
    message: e3?.message ?? String(e3),
    stack: e3?.stack,
    cause: e3?.cause === void 0 ? void 0 : reduceError(e3.cause)
  };
}
var jsonError = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e3) {
    const error = reduceError(e3);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
};
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-gDRb5B/middleware-insertion-facade.js
src_default.middleware = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default,
  ...src_default.middleware ?? []
].filter(Boolean);
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}

// .wrangler/tmp/bundle-gDRb5B/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (worker.middleware === void 0 || worker.middleware.length === 0) {
    return worker;
  }
  for (const middleware of worker.middleware) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  };
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      };
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
function wrapWorkerEntrypoint(klass) {
  if (klass.middleware === void 0 || klass.middleware.length === 0) {
    return klass;
  }
  for (const middleware of klass.middleware) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  middleware_loader_entry_default as default
};
/*! Bundled license information:

slack-edge/dist/cookie.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=index.js.map
