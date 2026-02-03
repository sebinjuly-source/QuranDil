# Engine Layer

Business logic layer for Quran memorization application. Pure TypeScript with NO UI components.

## Overview

This layer provides six core engines that power the QuranDil application:

1. **QuranApiClient** - API client with offline caching
2. **MushafRebuilder** - Page reconstruction with proper line grouping
3. **AyahWordMapper** - Spatial mapping for hit-testing
4. **FSRSEngine** - Spaced repetition scheduling
5. **CommandStack** - Undo/redo system
6. **AnnotationStore** - Drawing and highlight persistence

## Components

### 1. QuranApiClient

Cached, offline-safe Quran.com API client with IndexedDB storage.

```typescript
import { quranApiClient } from './engines/QuranApiClient';

// Get all verses on a page
const verses = await quranApiClient.getPageVerses(1);

// Get specific verse with word-level data
const verse = await quranApiClient.getVerseWithWords(2, 255);

// Get a single verse
const verse = await quranApiClient.getVerse(1, 1);

// Cache stats
const stats = await quranApiClient.getCacheStats();
```

**Features:**
- IndexedDB caching with 1-year TTL
- Automatic offline fallback
- Word-level data fetching
- Page-based and verse-based queries

### 2. MushafRebuilder

Rebuilds Mushaf pages while preserving traditional pagination.

```typescript
import { MushafRebuilder } from './engines/MushafRebuilder';
import { quranApiClient } from './engines/QuranApiClient';

const rebuilder = new MushafRebuilder(quranApiClient, 'madani-15-tajweed');

// Rebuild a single page
const page = await rebuilder.rebuildPage(1);

// Rebuild multiple pages
const pages = await rebuilder.rebuildPages(1, 10);

// Verify page boundaries
const isValid = await rebuilder.verifyPageBoundaries(1);
```

**Features:**
- Groups words by line number
- Preserves page boundaries from knownMushafs
- Batch page rebuilding
- Page boundary verification

### 3. AyahWordMapper

Word-level mapping with bounding box calculations for hit-testing.

```typescript
import { AyahWordMapper } from './engines/AyahWordMapper';

const mapper = new AyahWordMapper({
  pageWidth: 420,
  pageHeight: 600,
  lineHeight: 35,
});

// Build spatial map
const pageMap = mapper.buildPageMap(mushafPage);

// Hit-testing
const word = mapper.getWordAt(100, 200);

// Get ayah range between words
const ayahs = mapper.getAyahRange(startWord, endWord);

// Export/import
const json = mapper.toJSON();
mapper.fromJSON(json);
```

**Features:**
- Page → Ayah → Line → Word hierarchy
- Bounding box calculations
- Hit-testing at pixel coordinates
- JSON serializable

### 4. FSRSEngine

Simplified FSRS (Free Spaced Repetition Scheduler) optimized for Quran memorization.

```typescript
import { FSRSEngine, Rating, CardState } from './engines/FSRSEngine';

const fsrs = new FSRSEngine();

// Create a new card
const card = fsrs.createCard('page_1');

// Rate the card
const updatedCard = fsrs.rateCard(card, Rating.Good);

// Get due cards
const dueCards = fsrs.getDueCards(allCards);

// Get statistics
const stats = fsrs.getStats(allCards);
```

**Features:**
- Ratings: Again (1), Hard (2), Good (3), Easy (4)
- Card states: New, Learning, Review, Relearning
- Stability and difficulty tracking
- Hifz-optimized parameters

### 5. CommandStack

Undo/redo system implementing the Command pattern.

```typescript
import { CommandStack, FunctionCommand } from './engines/CommandStack';

const stack = new CommandStack({ maxSize: 50 });

// Create and execute a command
const command = new FunctionCommand(
  () => { /* execute */ },
  () => { /* undo */ },
  'Add annotation'
);

await stack.execute(command);

// Undo/redo
await stack.undo();
await stack.redo();

// Check state
stack.canUndo(); // boolean
stack.canRedo(); // boolean
```

**Features:**
- Command interface with execute/undo
- Stack size limit
- Command history tracking
- Composite commands support

### 6. AnnotationStore

IndexedDB-backed storage for user drawings and highlights.

```typescript
import { annotationStore, AnnotationType } from './engines/AnnotationStore';

// Add a highlight
const annotation = await annotationStore.addAnnotation({
  type: AnnotationType.Highlight,
  page_number: 1,
  verse_key: '2:255',
  data: {
    x: 100, y: 100,
    width: 200, height: 30,
    color: '#ffff00',
    opacity: 0.3,
  },
});

// Get annotations for a page
const annotations = await annotationStore.getAnnotations({ page_number: 1 });

// Delete annotation
await annotationStore.deleteAnnotation(annotation.id);

// Export/import
const json = await annotationStore.exportAnnotations();
await annotationStore.importAnnotations(json);
```

**Features:**
- Annotation types: Drawing, Highlight, Underline, Circle, Note
- IndexedDB persistence
- Filtering by page, verse, type, tags
- Export/import functionality

## Usage Example

Complete workflow:

```typescript
import {
  quranApiClient,
  MushafRebuilder,
  AyahWordMapper,
  FSRSEngine,
  CommandStack,
  annotationStore,
} from './engines';

// 1. Fetch and rebuild page
const rebuilder = new MushafRebuilder(quranApiClient);
const page = await rebuilder.rebuildPage(1);

// 2. Create spatial map
const mapper = new AyahWordMapper();
const pageMap = mapper.buildPageMap(page);

// 3. Hit-test for word selection
const word = mapper.getWordAt(100, 200);

// 4. Add annotation with undo support
const stack = new CommandStack();
await stack.execute({
  execute: async () => {
    await annotationStore.addAnnotation({
      type: AnnotationType.Highlight,
      page_number: 1,
      verse_key: word.verse_key,
      data: { x: 100, y: 200, width: 50, height: 20, color: '#ffff00' },
    });
  },
  undo: async () => {
    // Delete annotation
  },
});

// 5. Create flashcard for spaced repetition
const fsrs = new FSRSEngine();
const card = fsrs.createCard(`ayah_${word.verse_key}`);
const reviewedCard = fsrs.rateCard(card, Rating.Good);
```

## Technical Details

### Dependencies
- TypeScript 5.9+
- IndexedDB (native browser API)
- No external dependencies

### Browser Compatibility
- Chrome/Edge 87+
- Firefox 78+
- Safari 14+
- All support IndexedDB and ES6+

### Storage
- **QuranApiClient**: ~10-50MB for full Quran cache
- **AnnotationStore**: Varies by usage (~1-10MB typical)

### Performance
- API calls cached with 1-year TTL
- IndexedDB queries are indexed for fast lookups
- Page rebuilding: ~50-100ms per page
- Spatial mapping: ~10-20ms per page

## Testing

All engines are designed to be easily testable:

```typescript
// Mock API client
const mockClient = {
  getPageVerses: async () => [/* mock verses */],
};

const rebuilder = new MushafRebuilder(mockClient);
```

## Architecture Notes

- **Pure business logic** - No UI dependencies
- **Async-first** - All I/O operations return Promises
- **Type-safe** - Full TypeScript coverage
- **Singleton patterns** - For stores with shared state
- **Command pattern** - For reversible operations
- **Repository pattern** - For data persistence

## Future Enhancements

Potential additions:
- Audio playback engine
- Sync engine for multi-device support
- Advanced analytics engine
- Tajweed rule detection
- Translation management
