/**
 * GeoTools javascript coordinate transformations
 * http://files.dixo.net/geotools.html
 *
 * This file copyright (c)2005 Paul Dixon (paul@elphin.com)
 */

/*****************************************************************************
 *
 * GT_OSGB holds OSGB grid coordinates
 *
 *****************************************************************************/

export class GT_OSGB {
  constructor() {
    this.northings = 0;
    this.eastings = 0;
    this.status = "Undefined";
  }

  setGridCoordinates(eastings, northings) {
    this.northings = northings;
    this.eastings = eastings;
    this.status = "OK";
  }

  setError(msg) {
    this.status = msg;
  }

  _zeropad(num, len) {
    let str = new String(num);
    while (str.length < len) {
      str = `0${str}`;
    }
    return str;
  }

  getGridRef(precision) {
    if (precision < 0) precision = 0;
    if (precision > 5) precision = 5;

    var e = "";
    var n = "";
    if (precision > 0) {
      var y = Math.floor(this.northings / 100000);
      var x = Math.floor(this.eastings / 100000);

      var e = Math.round(this.eastings % 100000);
      var n = Math.round(this.northings % 100000);

      const div = 5 - precision;
      e = Math.round(e / 10 ** div);
      n = Math.round(n / 10 ** div);
    }

    const prefix = GT_OSGB.prefixes[y][x];

    return `${prefix} ${this._zeropad(e, precision)} ${this._zeropad(
      n,
      precision
    )}`;
  }

  parseGridRef(landranger) {
    let ok = false;

    this.northings = 0;
    this.eastings = 0;

    let precision;

    for (precision = 5; precision >= 1; precision--) {
      const pattern = new RegExp(
        `^([A-Z]{2})\\s*(\\d{${precision}})\\s*(\\d{${precision}})$`,
        "i"
      );
      const gridRef = landranger.match(pattern);
      if (gridRef) {
        const gridSheet = gridRef[1];
        let gridEast = 0;
        let gridNorth = 0;

        if (precision > 0) {
          const mult = 10 ** (5 - precision);
          gridEast = parseInt(gridRef[2], 10) * mult;
          gridNorth = parseInt(gridRef[3], 10) * mult;
        }

        let x;
        let y;
        search: for (y = 0; y < GT_OSGB.prefixes.length; y++) {
          for (x = 0; x < GT_OSGB.prefixes[y].length; x++)
            if (GT_OSGB.prefixes[y][x] == gridSheet) {
              this.eastings = x * 100000 + gridEast;
              this.northings = y * 100000 + gridNorth;
              ok = true;
              break search;
            }
        }
      }
    }

    return ok;
  }

  getWGS84() {
    const height = 0;

    const lat1 = GT_Math.E_N_to_Lat(
      this.eastings,
      this.northings,
      6377563.396,
      6356256.91,
      400000,
      -100000,
      0.999601272,
      49.0,
      -2.0
    );
    const lon1 = GT_Math.E_N_to_Long(
      this.eastings,
      this.northings,
      6377563.396,
      6356256.91,
      400000,
      -100000,
      0.999601272,
      49.0,
      -2.0
    );

    const x1 = GT_Math.Lat_Long_H_to_X(
      lat1,
      lon1,
      height,
      6377563.396,
      6356256.91
    );
    const y1 = GT_Math.Lat_Long_H_to_Y(
      lat1,
      lon1,
      height,
      6377563.396,
      6356256.91
    );
    const z1 = GT_Math.Lat_H_to_Z(lat1, height, 6377563.396, 6356256.91);

    const x2 = GT_Math.Helmert_X(x1, y1, z1, 446.448, 0.247, 0.8421, -20.4894);
    const y2 = GT_Math.Helmert_Y(
      x1,
      y1,
      z1,
      -125.157,
      0.1502,
      0.8421,
      -20.4894
    );
    const z2 = GT_Math.Helmert_Z(x1, y1, z1, 542.06, 0.1502, 0.247, -20.4894);

    const latitude = GT_Math.XYZ_to_Lat(x2, y2, z2, 6378137.0, 6356752.313);
    const longitude = GT_Math.XYZ_to_Long(x2, y2);

    const wgs84 = new GT_WGS84();
    wgs84.setDegrees(latitude, longitude);
    return wgs84;
  }
}

GT_OSGB.prefixes = new Array(
  new Array("SV", "SW", "SX", "SY", "SZ", "TV", "TW"),
  new Array("SQ", "SR", "SS", "ST", "SU", "TQ", "TR"),
  new Array("SL", "SM", "SN", "SO", "SP", "TL", "TM"),
  new Array("SF", "SG", "SH", "SJ", "SK", "TF", "TG"),
  new Array("SA", "SB", "SC", "SD", "SE", "TA", "TB"),
  new Array("NV", "NW", "NX", "NY", "NZ", "OV", "OW"),
  new Array("NQ", "NR", "NS", "NT", "NU", "OQ", "OR"),
  new Array("NL", "NM", "NN", "NO", "NP", "OL", "OM"),
  new Array("NF", "NG", "NH", "NJ", "NK", "OF", "OG"),
  new Array("NA", "NB", "NC", "ND", "NE", "OA", "OB"),
  new Array("HV", "HW", "HX", "HY", "HZ", "JV", "JW"),
  new Array("HQ", "HR", "HS", "HT", "HU", "JQ", "JR"),
  new Array("HL", "HM", "HN", "HO", "HP", "JL", "JM")
);

/*****************************************************************************
 *
 * GT_WGS84 holds WGS84 latitude and longitude
 *
 *****************************************************************************/

class GT_WGS84 {
  constructor() {
    this.latitude = 0;
    this.longitude = 0;
  }

  setDegrees(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  parseString(text) {
    let ok = false;

    const str = new String(text);

    const pattern =
      /([ns])\s*(\d+)[°\s]+(\d+\.\d+)\s+([we])\s*(\d+)[°\s]+(\d+\.\d+)/i;
    const matches = str.match(pattern);
    if (matches) {
      ok = true;
      const latsign = matches[1] == "s" || matches[1] == "S" ? -1 : 1;
      const longsign = matches[4] == "w" || matches[4] == "W" ? -1 : 1;

      const d1 = parseFloat(matches[2]);
      const m1 = parseFloat(matches[3]);
      const d2 = parseFloat(matches[5]);
      const m2 = parseFloat(matches[6]);

      this.latitude = latsign * (d1 + m1 / 60.0);
      this.longitude = longsign * (d2 + m2 / 60.0);
    }

    return ok;
  }

  isGreatBritain() {
    return (
      this.latitude > 49 &&
      this.latitude < 62 &&
      this.longitude > -9.5 &&
      this.longitude < 2.3
    );
  }

  isIreland() {
    return (
      this.latitude > 51.2 &&
      this.latitude < 55.73 &&
      this.longitude > -12.2 &&
      this.longitude < -4.8
    );
  }

  getOSGB() {
    const osgb = new GT_OSGB();
    if (this.isGreatBritain()) {
      const height = 0;

      const x1 = GT_Math.Lat_Long_H_to_X(
        this.latitude,
        this.longitude,
        6378137.0,
        6356752.313
      );
      const y1 = GT_Math.Lat_Long_H_to_Y(
        this.latitude,
        this.longitude,
        6378137.0,
        6356752.313
      );
      const z1 = GT_Math.Lat_H_to_Z(
        this.latitude,
        height,
        6378137.0,
        6356752.313
      );

      const x2 = GT_Math.Helmert_X(
        x1,
        y1,
        z1,
        -446.448,
        -0.247,
        -0.8421,
        20.4894
      );
      const y2 = GT_Math.Helmert_Y(
        x1,
        y1,
        z1,
        125.157,
        -0.1502,
        -0.8421,
        20.4894
      );
      const z2 = GT_Math.Helmert_Z(
        x1,
        y1,
        z1,
        -542.06,
        -0.1502,
        -0.247,
        20.4894
      );

      const latitude2 = GT_Math.XYZ_to_Lat(x2, y2, z2, 6377563.396, 6356256.91);
      const longitude2 = GT_Math.XYZ_to_Long(x2, y2);

      const e = GT_Math.Lat_Long_to_East(
        latitude2,
        longitude2,
        6377563.396,
        6356256.91,
        400000,
        0.999601272,
        49.0,
        -2.0
      );
      const n = GT_Math.Lat_Long_to_North(
        latitude2,
        longitude2,
        6377563.396,
        6356256.91,
        400000,
        -100000,
        0.999601272,
        49.0,
        -2.0
      );

      osgb.setGridCoordinates(Math.round(e), Math.round(n));
    } else {
      osgb.setError("Coordinate not within Great Britain");
    }

    return osgb;
  }
}

/*****************************************************************************
 *
 * GT_Math is a collection of static methods doing all the nasty sums
 *
 *****************************************************************************/

function GT_Math() {}

GT_Math.E_N_to_Lat = (East, North, a, b, e0, n0, f0, PHI0, LAM0) => {
  const Pi = 3.14159265358979;
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const Et = East - e0;

  const PHId = GT_Math.InitialLat(North, n0, af0, RadPHI0, n, bf0);

  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(PHId) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(PHId) ** 2);
  const eta2 = nu / rho - 1;

  const VII = Math.tan(PHId) / (2 * rho * nu);
  const VIII =
    (Math.tan(PHId) / (24 * rho * nu ** 3)) *
    (5 + 3 * Math.tan(PHId) ** 2 + eta2 - 9 * eta2 * Math.tan(PHId) ** 2);
  const IX =
    (Math.tan(PHId) / (720 * rho * nu ** 5)) *
    (61 + 90 * (Math.tan(PHId) ^ 2) + 45 * Math.tan(PHId) ** 4);

  const E_N_to_Lat =
    (180 / Pi) * (PHId - Et ** 2 * VII + Et ** 4 * VIII - (Et ^ 6) * IX);

  return E_N_to_Lat;
};

GT_Math.E_N_to_Long = (East, North, a, b, e0, n0, f0, PHI0, LAM0) => {
  const Pi = 3.14159265358979;
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const Et = East - e0;

  const PHId = GT_Math.InitialLat(North, n0, af0, RadPHI0, n, bf0);

  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(PHId) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(PHId) ** 2);
  const eta2 = nu / rho - 1;

  const X = Math.cos(PHId) ** -1 / nu;
  const XI =
    (Math.cos(PHId) ** -1 / (6 * nu ** 3)) *
    (nu / rho + 2 * Math.tan(PHId) ** 2);
  const XII =
    (Math.cos(PHId) ** -1 / (120 * nu ** 5)) *
    (5 + 28 * Math.tan(PHId) ** 2 + 24 * Math.tan(PHId) ** 4);
  const XIIA =
    (Math.cos(PHId) ** -1 / (5040 * nu ** 7)) *
    (61 +
      662 * Math.tan(PHId) ** 2 +
      1320 * Math.tan(PHId) ** 4 +
      720 * Math.tan(PHId) ** 6);

  const E_N_to_Long =
    (180 / Pi) *
    (RadLAM0 + Et * X - Et ** 3 * XI + Et ** 5 * XII - Et ** 7 * XIIA);

  return E_N_to_Long;
};

GT_Math.InitialLat = (North, n0, afo, PHI0, n, bfo) => {
  let PHI1 = (North - n0) / afo + PHI0;
  let M = GT_Math.Marc(bfo, n, PHI0, PHI1);
  let PHI2 = (North - n0 - M) / afo + PHI1;

  while (Math.abs(North - n0 - M) > 0.00001) {
    PHI2 = (North - n0 - M) / afo + PHI1;
    M = GT_Math.Marc(bfo, n, PHI0, PHI2);
    PHI1 = PHI2;
  }
  return PHI2;
};

GT_Math.Lat_Long_H_to_X = (PHI, LAM, H, a, b) => {
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);

  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const V = a / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);

  return (V + H) * Math.cos(RadPHI) * Math.cos(RadLAM);
};

GT_Math.Lat_Long_H_to_Y = (PHI, LAM, H, a, b) => {
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);

  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const V = a / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);

  return (V + H) * Math.cos(RadPHI) * Math.sin(RadLAM);
};

GT_Math.Lat_H_to_Z = (PHI, H, a, b) => {
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);

  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const V = a / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);

  return (V * (1 - e2) + H) * Math.sin(RadPHI);
};

GT_Math.Helmert_X = (X, Y, Z, DX, Y_Rot, Z_Rot, s) => {
  const Pi = 3.14159265358979;
  const sfactor = s * 0.000001;
  const RadY_Rot = (Y_Rot / 3600) * (Pi / 180);
  const RadZ_Rot = (Z_Rot / 3600) * (Pi / 180);

  return X + X * sfactor - Y * RadZ_Rot + Z * RadY_Rot + DX;
};

GT_Math.Helmert_Y = (X, Y, Z, DY, X_Rot, Z_Rot, s) => {
  const Pi = 3.14159265358979;
  const sfactor = s * 0.000001;
  const RadX_Rot = (X_Rot / 3600) * (Pi / 180);
  const RadZ_Rot = (Z_Rot / 3600) * (Pi / 180);

  return X * RadZ_Rot + Y + Y * sfactor - Z * RadX_Rot + DY;
};

GT_Math.Helmert_Z = (X, Y, Z, DZ, X_Rot, Y_Rot, s) => {
  const Pi = 3.14159265358979;
  const sfactor = s * 0.000001;
  const RadX_Rot = (X_Rot / 3600) * (Pi / 180);
  const RadY_Rot = (Y_Rot / 3600) * (Pi / 180);

  return -1 * X * RadY_Rot + Y * RadX_Rot + Z + Z * sfactor + DZ;
};

GT_Math.XYZ_to_Lat = (X, Y, Z, a, b) => {
  const RootXYSqr = Math.sqrt(X ** 2 + Y ** 2);
  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const PHI1 = Math.atan2(Z, RootXYSqr * (1 - e2));

  const PHI = GT_Math.Iterate_XYZ_to_Lat(a, e2, PHI1, Z, RootXYSqr);

  const Pi = 3.14159265358979;

  return PHI * (180 / Pi);
};

GT_Math.Iterate_XYZ_to_Lat = (a, e2, PHI1, Z, RootXYSqr) => {
  let V = a / Math.sqrt(1 - e2 * Math.sin(PHI1) ** 2);
  let PHI2 = Math.atan2(Z + e2 * V * Math.sin(PHI1), RootXYSqr);

  while (Math.abs(PHI1 - PHI2) > 0.000000001) {
    PHI1 = PHI2;
    V = a / Math.sqrt(1 - e2 * Math.sin(PHI1) ** 2);
    PHI2 = Math.atan2(Z + e2 * V * Math.sin(PHI1), RootXYSqr);
  }

  return PHI2;
};

GT_Math.XYZ_to_Long = (X, Y) => {
  const Pi = 3.14159265358979;
  return Math.atan2(Y, X) * (180 / Pi);
};

GT_Math.Marc = (bf0, n, PHI0, PHI) =>
  bf0 *
  ((1 + n + (5 / 4) * n ** 2 + (5 / 4) * n ** 3) * (PHI - PHI0) -
    (3 * n + 3 * n ** 2 + (21 / 8) * n ** 3) *
      Math.sin(PHI - PHI0) *
      Math.cos(PHI + PHI0) +
    ((15 / 8) * n ** 2 + (15 / 8) * n ** 3) *
      Math.sin(2 * (PHI - PHI0)) *
      Math.cos(2 * (PHI + PHI0)) -
    (35 / 24) *
      n ** 3 *
      Math.sin(3 * (PHI - PHI0)) *
      Math.cos(3 * (PHI + PHI0)));

GT_Math.Lat_Long_to_East = (PHI, LAM, a, b, e0, f0, PHI0, LAM0) => {
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(RadPHI) ** 2);
  const eta2 = nu / rho - 1;
  const p = RadLAM - RadLAM0;

  const IV = nu * Math.cos(RadPHI);
  const V =
    (nu / 6) * Math.cos(RadPHI) ** 3 * (nu / rho - Math.tan(RadPHI) ** 2);
  const VI =
    (nu / 120) *
    Math.cos(RadPHI) ** 5 *
    (5 -
      18 * Math.tan(RadPHI) ** 2 +
      Math.tan(RadPHI) ** 4 +
      14 * eta2 -
      58 * Math.tan(RadPHI) ** 2 * eta2);

  return e0 + p * IV + p ** 3 * V + p ** 5 * VI;
};

GT_Math.Lat_Long_to_North = (PHI, LAM, a, b, e0, n0, f0, PHI0, LAM0) => {
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(RadPHI) ** 2);
  const eta2 = nu / rho - 1;
  const p = RadLAM - RadLAM0;
  const M = GT_Math.Marc(bf0, n, RadPHI0, RadPHI);

  const I = M + n0;
  const II = (nu / 2) * Math.sin(RadPHI) * Math.cos(RadPHI);
  const III =
    (nu / 24) *
    Math.sin(RadPHI) *
    Math.cos(RadPHI) ** 3 *
    (5 - Math.tan(RadPHI) ** 2 + 9 * eta2);
  const IIIA =
    (nu / 720) *
    Math.sin(RadPHI) *
    Math.cos(RadPHI) ** 5 *
    (61 - 58 * Math.tan(RadPHI) ** 2 + Math.tan(RadPHI) ** 4);

  return I + p ** 2 * II + p ** 4 * III + p ** 6 * IIIA;
};

/*****************************************************************************
 *
 * Coordinate Validation Functions
 *
 *****************************************************************************/

export class CoordinateValidator {
  constructor() {
    this.errors = [];
  }

  validateDecimalDegrees(lat, lon) {
    this.errors = [];

    if (!lat || !lon) {
      this.errors.push("Both latitude and longitude are required");
      return false;
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      this.errors.push("Latitude and longitude must be valid numbers");
      return false;
    }

    if (latNum < -90 || latNum > 90) {
      this.errors.push("Latitude must be between -90 and 90 degrees");
      return false;
    }

    if (lonNum < -180 || lonNum > 180) {
      this.errors.push("Longitude must be between -180 and 180 degrees");
      return false;
    }

    // Check if coordinates are within Great Britain
    const wgs84 = new GT_WGS84();
    wgs84.setDegrees(latNum, lonNum);

    if (!wgs84.isGreatBritain()) {
      this.errors.push("Coordinates must be within Great Britain");
      return false;
    }

    return true;
  }

  validateDegreesDecimalMinutes(
    latDeg,
    latMin,
    latDir,
    lonDeg,
    lonMin,
    lonDir
  ) {
    this.errors = [];

    if (!latDeg || !latMin || !latDir || !lonDeg || !lonMin || !lonDir) {
      this.errors.push("All coordinate fields are required");
      return false;
    }

    const latDegNum = parseInt(latDeg);
    const latMinNum = parseFloat(latMin);
    const lonDegNum = parseInt(lonDeg);
    const lonMinNum = parseFloat(lonMin);

    if (
      isNaN(latDegNum) ||
      isNaN(latMinNum) ||
      isNaN(lonDegNum) ||
      isNaN(lonMinNum)
    ) {
      this.errors.push("All coordinate values must be valid numbers");
      return false;
    }

    if (latDegNum < 0 || latDegNum > 90) {
      this.errors.push("Latitude degrees must be between 0 and 90");
      return false;
    }

    if (latMinNum < 0 || latMinNum >= 60) {
      this.errors.push("Latitude minutes must be between 0 and 59.999");
      return false;
    }

    if (lonDegNum < 0 || lonDegNum > 180) {
      this.errors.push("Longitude degrees must be between 0 and 180");
      return false;
    }

    if (lonMinNum < 0 || lonMinNum >= 60) {
      this.errors.push("Longitude minutes must be between 0 and 59.999");
      return false;
    }

    // Convert to decimal degrees for validation
    const latSign = latDir === "S" ? -1 : 1;
    const lonSign = lonDir === "W" ? -1 : 1;

    const latDecimal = latSign * (latDegNum + latMinNum / 60);
    const lonDecimal = lonSign * (lonDegNum + lonMinNum / 60);

    return this.validateDecimalDegrees(latDecimal, lonDecimal);
  }

  validateDegreesMinutesSeconds(
    latDeg,
    latMin,
    latSec,
    latDir,
    lonDeg,
    lonMin,
    lonSec,
    lonDir
  ) {
    this.errors = [];

    if (
      !latDeg ||
      !latMin ||
      !latSec ||
      !latDir ||
      !lonDeg ||
      !lonMin ||
      !lonSec ||
      !lonDir
    ) {
      this.errors.push("All coordinate fields are required");
      return false;
    }

    const latDegNum = parseInt(latDeg);
    const latMinNum = parseInt(latMin);
    const latSecNum = parseFloat(latSec);
    const lonDegNum = parseInt(lonDeg);
    const lonMinNum = parseInt(lonMin);
    const lonSecNum = parseFloat(lonSec);

    if (
      isNaN(latDegNum) ||
      isNaN(latMinNum) ||
      isNaN(latSecNum) ||
      isNaN(lonDegNum) ||
      isNaN(lonMinNum) ||
      isNaN(lonSecNum)
    ) {
      this.errors.push("All coordinate values must be valid numbers");
      return false;
    }

    if (latDegNum < 0 || latDegNum > 90) {
      this.errors.push("Latitude degrees must be between 0 and 90");
      return false;
    }

    if (latMinNum < 0 || latMinNum >= 60) {
      this.errors.push("Latitude minutes must be between 0 and 59");
      return false;
    }

    if (latSecNum < 0 || latSecNum >= 60) {
      this.errors.push("Latitude seconds must be between 0 and 59.999");
      return false;
    }

    if (lonDegNum < 0 || lonDegNum > 180) {
      this.errors.push("Longitude degrees must be between 0 and 180");
      return false;
    }

    if (lonMinNum < 0 || lonMinNum >= 60) {
      this.errors.push("Longitude minutes must be between 0 and 59");
      return false;
    }

    if (lonSecNum < 0 || lonSecNum >= 60) {
      this.errors.push("Longitude seconds must be between 0 and 59.999");
      return false;
    }

    // Convert to decimal degrees for validation
    const latSign = latDir === "S" ? -1 : 1;
    const lonSign = lonDir === "W" ? -1 : 1;

    const latDecimal =
      latSign * (latDegNum + latMinNum / 60 + latSecNum / 3600);
    const lonDecimal =
      lonSign * (lonDegNum + lonMinNum / 60 + lonSecNum / 3600);

    return this.validateDecimalDegrees(latDecimal, lonDecimal);
  }

  validateOSGridRef(square, easting, northing) {
    this.errors = [];

    if (!square || !easting || !northing) {
      this.errors.push("All grid reference fields are required");
      return false;
    }

    const eastingNum = parseInt(easting);
    const northingNum = parseInt(northing);

    if (isNaN(eastingNum) || isNaN(northingNum)) {
      this.errors.push("Easting and northing must be valid numbers");
      return false;
    }

    if (eastingNum < 0 || eastingNum > 99999) {
      this.errors.push("Easting must be between 0 and 99999");
      return false;
    }

    if (northingNum < 0 || northingNum > 99999) {
      this.errors.push("Northing must be between 0 and 99999");
      return false;
    }

    // Validate grid square format
    if (!/^[A-Z]{2}$/i.test(square)) {
      this.errors.push("Grid square must be two letters (e.g., TQ, SW)");
      return false;
    }

    // Try to parse the complete grid reference
    const osgb = new GT_OSGB();
    const gridRef = `${square.toUpperCase()} ${easting} ${northing}`;

    if (!osgb.parseGridRef(gridRef)) {
      this.errors.push("Invalid grid reference format");
      return false;
    }

    // Check if the coordinates are within Great Britain
    const wgs84 = osgb.getWGS84();
    if (!wgs84.isGreatBritain()) {
      this.errors.push("Grid reference must be within Great Britain");
      return false;
    }

    return true;
  }

  // Validate a full OS grid reference string, e.g., "TQ 3003 8038" or "TQ30038038"
  validateOSGridReferenceNumber(gridRefText) {
    this.errors = [];

    if (!gridRefText || gridRefText.trim().length === 0) {
      this.errors.push("Enter an OS grid reference");
      return false;
    }

    const osgb = new GT_OSGB();
    const cleaned = gridRefText.trim().replace(/\s+/g, " ");

    if (!osgb.parseGridRef(cleaned)) {
      this.errors.push(
        "Enter a valid OS grid reference (for example, TQ 3003 8038)"
      );
      return false;
    }

    const wgs84 = osgb.getWGS84();
    if (!wgs84.isGreatBritain()) {
      this.errors.push("Grid reference must be within Great Britain");
      return false;
    }

    return true;
  }

  // Validate Easting and Northing without a 100km grid square (range checks only)
  validateEastingNorthing(easting, northing) {
    this.errors = [];

    if (!easting || !northing) {
      this.errors.push("Enter easting and northing");
      return false;
    }

    const eastingNum = parseInt(easting, 10);
    const northingNum = parseInt(northing, 10);

    if (isNaN(eastingNum) || isNaN(northingNum)) {
      this.errors.push("Easting and northing must be valid numbers");
      return false;
    }

    // Match the 5-digit format used in the UI example
    if (eastingNum < 0 || eastingNum > 99999) {
      this.errors.push("Easting must be between 0 and 99999");
      return false;
    }

    if (northingNum < 0 || northingNum > 99999) {
      this.errors.push("Northing must be between 0 and 99999");
      return false;
    }

    return true;
  }

  // Minimal validation for National Grid field number (non-empty)
  validateNationalGridFieldNumber(value) {
    this.errors = [];

    if (!value || value.trim().length === 0) {
      this.errors.push("Enter the National Grid field number");
      return false;
    }

    return true;
  }

  getErrors() {
    return this.errors;
  }
}
