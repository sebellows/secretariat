var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils/common.ts
__export(exports, {
  isDefined: () => isDefined,
  isNil: () => isNil,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  typeOf: () => typeOf
});
var isNil = (obj) => obj === void 0 || obj === null;
var isDefined = (obj) => obj !== void 0 && obj !== null;
var isObject = (obj) => typeof obj === "object";
var typeOf = (obj, is) => {
  const type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  return is ? type === is : type;
};
var isPlainObject = (obj) => typeOf(obj, "object");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isDefined,
  isNil,
  isObject,
  isPlainObject,
  typeOf
});
