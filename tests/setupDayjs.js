import dayjsLib from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

dayjsLib.extend(customParseFormat);
dayjsLib.extend(utc);

globalThis.dayjs = dayjsLib;
