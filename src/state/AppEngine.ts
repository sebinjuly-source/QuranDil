/**
 * AppEngine - Singleton engine initializer
 * Single source of truth for all engine instances
 */

import { quranApiClient } from '../engines/QuranApiClient';
import { MushafRebuilder } from '../engines/MushafRebuilder';
import { AyahWordMapper } from '../engines/AyahWordMapper';
import { FSRSEngine } from '../engines/FSRSEngine';
import { CommandStack } from '../engines/CommandStack';
import { annotationStore } from '../engines/AnnotationStore';

class AppEngineClass {
  private static instance: AppEngineClass;
  
  private _quranApi = quranApiClient;
  private _mushafRebuilder = new MushafRebuilder(quranApiClient);
  private _fsrsEngine = new FSRSEngine();
  private _commandStack = new CommandStack({ maxSize: 50 }); // 50 undo levels
  private _annotationStore = annotationStore;
  private _ayahMappers: Map<number, AyahWordMapper> = new Map();

  private constructor() {}

  static getInstance(): AppEngineClass {
    if (!AppEngineClass.instance) {
      AppEngineClass.instance = new AppEngineClass();
    }
    return AppEngineClass.instance;
  }

  get quranApi() {
    return this._quranApi;
  }

  get mushafRebuilder() {
    return this._mushafRebuilder;
  }

  get fsrsEngine() {
    return this._fsrsEngine;
  }

  get commandStack() {
    return this._commandStack;
  }

  get annotationStore() {
    return this._annotationStore;
  }

  /**
   * Get or create an AyahWordMapper for a specific page
   */
  getAyahMapper(pageNumber: number): AyahWordMapper {
    if (!this._ayahMappers.has(pageNumber)) {
      this._ayahMappers.set(pageNumber, new AyahWordMapper());
    }
    return this._ayahMappers.get(pageNumber)!;
  }

  /**
   * Clear mapper cache to free memory
   */
  clearMapperCache(pageNumber?: number) {
    if (pageNumber !== undefined) {
      this._ayahMappers.delete(pageNumber);
    } else {
      this._ayahMappers.clear();
    }
  }
}

export const AppEngine = AppEngineClass.getInstance();
