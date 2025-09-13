import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";
import { Key, Scale } from "tblswvs";


export class Configuration {
  iterations;
  key;
  chordTypes;
  durations;
  scaleDegrees;
  drumPads;


  constructor(configFilepath) {
    this.#loadConfig(configFilepath);
  }


  #loadConfig(configFilepath) {
    let config;

    if (configFilepath !== undefined && fs.existsSync(path.resolve(import.meta.dirname, configFilepath))) {
      config = this.#parseYamlFile(path.resolve(import.meta.dirname, configFilepath));
    } else {
      config = this.#parseYamlFile(this.#defaultConfigurationFilepath());
    }

    this.iterations   = config.iterations;
    this.key          = new Key(config.key.tonic, Scale[config.key.scale]);
    this.chordTypes   = config.chord_types;
    this.durations    = config.durations;
    this.scaleDegrees = config.scale_degrees;
    this.drumPads     = config.drum_pads;
  }


  #parseYamlFile(filepath) {
    try {
      return yaml.load(fs.readFileSync(filepath, "utf-8"));
    } catch (YAMLException) {
      console.error(`There was a problem parsing ${filepath}.`)
      console.error(`Using default configuration file ${this.#defaultConfigurationFilepath()}.`);
      return yaml.load(fs.readFileSync(this.#defaultConfigurationFilepath(), "utf-8"));
    }
  }


  #defaultConfigurationFilepath() {
    return path.resolve(import.meta.dirname, "..", "config", "defaults.yml");
  }
}
