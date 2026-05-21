// Import utility functions via ES modules
self.importScripts = null; // Clear importScripts to use ES modules

// Define utility functions that were previously imported
const flattenJSON = (data) => {
  // Your flattenJSON implementation
  const result = {};
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (let i = 0; i < cur.length; i++) {
        recurse(cur[i], prop + '[' + i + ']');
      }
      if (cur.length === 0) result[prop] = [];
    } else {
      let isEmpty = true;
      for (let p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  };
  recurse(data, '');
  return result;
};

const groupJSON = (data) => {
  // Your groupJSON implementation
  const result = {};
  for (let key in data) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i].replace(/\[(\d+)\]/g, '');
      if (!current[k]) current[k] = /\[(\d+)\]/.test(keys[i]) ? [] : {};
      current = current[k];
    }
    const lastKey = keys[keys.length - 1];
    current[lastKey] = data[key];
  }
  return result;
};

const smartNormalize = (data) => {
  // Your smartNormalize implementation
  const normalizeValue = (value) => {
    if (typeof value === 'string') {
      // Try to parse numbers
      if (!isNaN(value) && value.trim() !== '') {
        const num = Number(value);
        if (!isNaN(num)) return num;
      }
      // Try to parse booleans
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      // Try to parse JSON
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  const recurse = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => recurse(item));
    } else if (obj && typeof obj === 'object') {
      const result = {};
      for (let key in obj) {
        result[key] = recurse(normalizeValue(obj[key]));
      }
      return result;
    }
    return normalizeValue(obj);
  };

  return recurse(data);
};

const jsonToXML = (data, rootName = 'root') => {
  // Your jsonToXML implementation
  const convert = (obj, indent = '') => {
    let xml = '';
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        xml += `${indent}<item>\n${convert(item, indent + '  ')}${indent}</item>\n`;
      });
    } else if (obj && typeof obj === 'object') {
      for (let key in obj) {
        xml += `${indent}<${key}>\n${convert(obj[key], indent + '  ')}${indent}</${key}>\n`;
      }
    } else {
      xml += `${indent}${obj}\n`;
    }
    return xml;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${convert(data, '  ')}</${rootName}>`;
};

const jsonToSQLInsert = (tableName, data, options = {}) => {
  // Your jsonToSQLInsert implementation
  const { dialect = 'postgres', includeDrop = false, includeCreate = false, useBatch = true } = options;
  
  let sql = '';
  
  if (includeDrop) {
    sql += `DROP TABLE IF EXISTS ${tableName};\n\n`;
  }
  
  if (includeCreate && data.length > 0) {
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    const columnDefs = columns.map(col => {
      const value = firstRow[col];
      let type = 'TEXT';
      if (typeof value === 'number') type = dialect === 'mysql' ? 'DECIMAL(10,2)' : 'NUMERIC';
      if (typeof value === 'boolean') type = 'BOOLEAN';
      if (value instanceof Date) type = 'TIMESTAMP';
      return `  ${col} ${type}`;
    });
    
    sql += `CREATE TABLE ${tableName} (\n${columnDefs.join(',\n')}\n);\n\n`;
  }
  
  if (useBatch && data.length > 0) {
    const columns = Object.keys(data[0]);
    const values = data.map(row => {
      return `(${columns.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        return value;
      }).join(', ')})`;
    });
    
    sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${values.join(',\n')};`;
  } else {
    data.forEach(row => {
      const columns = Object.keys(row);
      const values = columns.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        return value;
      });
      
      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    });
  }
  
  return sql.trim();
};

const jsonToSchema = (data) => {
  // Your jsonToSchema implementation
  const getType = (value) => {
    if (Array.isArray(value)) {
      return {
        type: 'array',
        items: value.length > 0 ? getType(value[0]) : {}
      };
    } else if (value === null) {
      return { type: 'null' };
    } else if (typeof value === 'object') {
      return {
        type: 'object',
        properties: Object.keys(value).reduce((acc, key) => {
          acc[key] = getType(value[key]);
          return acc;
        }, {})
      };
    } else {
      return { type: typeof value };
    }
  };
  
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...getType(data)
  };
};

const autoFixJson = (jsonString) => {
  // Your autoFixJson implementation
  try {
    // Try to parse as-is first
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch (e) {
    // Try to fix common issues
    let fixed = jsonString
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix unquoted keys
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/:\s*undefined/g, ': null') // Replace undefined with null
      .replace(/:\s*NaN/g, ': null') // Replace NaN with null
      .replace(/:\s*Infinity/g, ': null'); // Replace Infinity with null
    
    try {
      return JSON.stringify(JSON.parse(fixed), null, 2);
    } catch (e2) {
      throw new Error(`Unable to auto-fix JSON: ${e2.message}`);
    }
  }
};

// Worker message handler
self.onmessage = async function(e) {
  const { id, type, payload, options } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'FORMAT':
        result = JSON.stringify(JSON.parse(payload), null, options?.indent || 2);
        break;
        
      case 'MINIFY':
        result = JSON.stringify(JSON.parse(payload));
        break;
        
      case 'DIFF':
        const left = JSON.stringify(JSON.parse(payload.left), null, 2).split('\n');
        const right = JSON.stringify(JSON.parse(payload.right), null, 2).split('\n');
        let diff = '';
        for (let i = 0; i < Math.max(left.length, right.length); i++) {
          if (left[i] === right[i]) {
            diff += `  ${left[i] ?? ''}\n`;
          } else {
            diff += `- ${left[i] ?? ''}\n`;
            diff += `+ ${right[i] ?? ''}\n`;
          }
        }
        result = diff;
        break;
        
      case 'FLATTEN':
        result = JSON.stringify(flattenJSON(JSON.parse(payload)), null, 2);
        break;
        
      case 'GROUP':
        result = JSON.stringify(groupJSON(JSON.parse(payload)), null, 2);
        break;
        
      case 'SMART_NORMALIZE':
        result = JSON.stringify(smartNormalize(JSON.parse(payload)), null, 2);
        break;
        
      case 'JSON_TO_TS':
        const convertToTypeScript = (obj) => {
          if (Array.isArray(obj)) {
            return obj.length > 0 ? `${convertToTypeScript(obj[0])}[]` : 'any[]';
          }
          if (obj && typeof obj === 'object') {
            return (
              '{\n' +
              Object.keys(obj)
                .map((k) => `  ${k}: ${convertToTypeScript(obj[k])};`)
                .join('\n') +
              '\n}'
            );
          }
          return typeof obj;
        };
        result = convertToTypeScript(JSON.parse(payload));
        break;
        
      case 'JSON_TO_CSV':
        const parsed = JSON.parse(payload);
        if (!Array.isArray(parsed)) {
          throw new Error('CSV conversion requires an array');
        }
        if (parsed.length === 0) {
          result = '';
          break;
        }
        const headers = Object.keys(parsed[0]);
        const csvRows = parsed.map((row) =>
          headers
            .map((header) => {
              const value = row[header] ?? '';
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',')
        );
        result = [headers.join(','), ...csvRows].join('\n');
        break;
        
      case 'JSON_TO_YAML':
        const jsonToYaml = (obj, level = 0) => {
          const pad = '  '.repeat(level);
          if (Array.isArray(obj)) {
            return obj
              .map((item) =>
                typeof item === 'object' 
                  ? `${pad}-\n${jsonToYaml(item, level + 1)}` 
                  : `${pad}- ${item}`
              )
              .join('\n');
          }
          if (obj && typeof obj === 'object') {
            return Object.keys(obj)
              .map((key) =>
                typeof obj[key] === 'object'
                  ? `${pad}${key}:\n${jsonToYaml(obj[key], level + 1)}`
                  : `${pad}${key}: ${obj[key]}`
              )
              .join('\n');
          }
          return `${pad}${obj}`;
        };
        result = jsonToYaml(JSON.parse(payload));
        break;
        
      case 'JSON_TO_XML':
        result = jsonToXML(JSON.parse(payload));
        break;
        
      case 'JSON_TO_SQL':
        const { tableName, data, dialect, includeDrop, includeCreate, useBatch } = payload;
        result = jsonToSQLInsert(tableName, data, { dialect, includeDrop, includeCreate, useBatch });
        break;
        
      case 'JSON_TO_SCHEMA':
        result = JSON.stringify(jsonToSchema(JSON.parse(payload)), null, 2);
        break;
        
      case 'AUTO_FIX':
        result = autoFixJson(payload);
        break;
        
      case 'LARGE_FORMAT':
        // Parse the entire JSON string in the worker (off-main-thread)
        self.postMessage({ id, progress: 10 });
        const largeParsed = JSON.parse(payload);
        self.postMessage({ id, progress: 70 });
        result = JSON.stringify(largeParsed, null, options?.indent ?? 2);
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
    
    self.postMessage({ id, result });
    
  } catch (error) {
    self.postMessage({ 
      id, 
      error: error.message,
      stack: error.stack 
    });
  }
};