# 🛠️ Guide de développement Backend - EpiTrello

Ce guide détaille les conventions de code, bonnes pratiques, processus de test et de debugging pour le développement du backend EpiTrello.

## 📋 Table des matières

- [Environnement de développement](#environnement-de-développement)
- [Conventions de code](#conventions-de-code)
- [Structure d'un module](#structure-dun-module)
- [Bonnes pratiques](#bonnes-pratiques)
- [Tests](#tests)
- [Debugging](#debugging)
- [Git workflow](#git-workflow)
- [Performance](#performance)
- [Sécurité](#sécurité)

---

## 💻 Environnement de développement

### Prérequis

- **Node.js** 22.x ou supérieur
- **npm** 10.x ou supérieur
- **Git** 2.x
- **VSCode** (recommandé) ou autre IDE
- Compte **Supabase** (gratuit)

### Installation

```bash
# Cloner le repo
git clone https://github.com/votre-org/epitrello.git
cd epitrello/backend

# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env
# Éditer .env avec vos credentials Supabase

# Démarrer en mode dev
npm run start:dev
```

### Extensions VSCode recommandées

- **ESLint** - Linting en temps réel
- **Prettier** - Formatage automatique
- **REST Client** - Tester les endpoints (fichiers `.rest`)
- **GitLens** - Historique Git avancé
- **Thunder Client** - Alternative à Postman

### Configuration VSCode

Créez `.vscode/settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 📝 Conventions de code

### Naming conventions

#### Fichiers

- **Modules** : `xxx.module.ts`
- **Controllers** : `xxx.controller.ts`
- **Services** : `xxx.service.ts`
- **DTOs** : `xxx.dto.ts`
- **Interfaces** : `xxx.interface.ts`
- **Tests** : `xxx.spec.ts`

**Exemple :**
```
boards/
├── boards.module.ts
├── boards.controller.ts
├── boards.service.ts
├── boards.controller.spec.ts
└── boards.service.spec.ts
```

---

#### Variables et fonctions

```typescript
// ✅ Bon : camelCase
const userId = '123';
const accessToken = 'abc';

function getUserProfile() {}
async function createBoard() {}

// ❌ Mauvais
const user_id = '123';
const AccessToken = 'abc';
function get_user_profile() {}
```

---

#### Classes et interfaces

```typescript
// ✅ Bon : PascalCase
class BoardsService {}
interface Board {}
class CreateBoardDto {}

// ❌ Mauvais
class boardsService {}
interface board {}
class createBoardDto {}
```

---

#### Constantes

```typescript
// ✅ Bon : UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DEFAULT_PAGE_SIZE = 20;

// ❌ Mauvais
const maxFileSize = 5 * 1024 * 1024;
const defaultPageSize = 20;
```

---

### Style de code

#### Imports

Grouper et ordonner les imports :

```typescript
// 1. Imports Node.js / externes
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 2. Imports internes
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBoardDto } from './dto/create-board.dto';

// 3. Imports de types
import type { Board } from './interfaces/board.interface';
```

---

#### Formatage

Utiliser **Prettier** avec la config par défaut :

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

**Commande :**
```bash
npm run format
```

---

#### Commentaires

```typescript
/**
 * Service gérant les boards (tableaux).
 * 
 * Responsabilités :
 * - CRUD des boards
 * - Gestion des permissions
 * - Création de boards par défaut
 */
@Injectable()
export class BoardsService {
  
  /**
   * Crée un nouveau board avec des listes par défaut.
   * 
   * @param board - Données du board à créer
   * @returns Le board créé avec son ID
   * @throws {BadRequestException} Si les données sont invalides
   */
  async create(board: CreateBoardDto): Promise<Board> {
    // Implementation
  }
}
```

**Guidelines :**
- JSDoc pour les classes, méthodes publiques
- Commentaires inline uniquement si logique complexe
- Pas de commentaires évidents : `// Increment counter` ❌

---

### TypeScript

#### Types explicites

```typescript
// ✅ Bon : Types explicites
async findOne(id: string): Promise<Board> {
  const { data, error } = await this.supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw new NotFoundException();
  return data as Board;
}

// ❌ Mauvais : Types implicites
async findOne(id) {
  const { data, error } = await this.supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw new NotFoundException();
  return data;
}
```

---

#### Interfaces vs Types

**Privilégier les interfaces** pour les objets :

```typescript
// ✅ Bon
interface Board {
  id: string;
  title: string;
  created_at: string;
}

// ❌ Éviter (sauf pour les unions)
type Board = {
  id: string;
  title: string;
  created_at: string;
};

// ✅ OK pour les unions
type Status = 'pending' | 'accepted' | 'rejected';
```

---

#### Éviter `any`

```typescript
// ❌ Mauvais
function processData(data: any) {
  return data.value;
}

// ✅ Bon : Type spécifique
interface DataPayload {
  value: string;
}

function processData(data: DataPayload) {
  return data.value;
}

// ✅ Acceptable : Type générique
function processData<T>(data: T): T {
  return data;
}

// ✅ OK si vraiment inconnu
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type narrowing
  }
}
```

---

## 🏗️ Structure d'un module

### Template de module complet

```
feature/
├── feature.module.ts        # Module NestJS
├── feature.controller.ts    # Routes HTTP
├── feature.service.ts       # Logique métier
├── feature.controller.spec.ts   # Tests controller
├── feature.service.spec.ts      # Tests service
├── dto/                     # Data Transfer Objects
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── query-feature.dto.ts
└── interfaces/              # Interfaces TypeScript
    └── feature.interface.ts
```

---

### Module template

```typescript
import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],      // Dépendances
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],      // Exporter si utilisé ailleurs
})
export class FeatureModule {}
```

---

### Controller template

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import type { Feature } from './interfaces/feature.interface';

@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  findAll(@Query('userId') userId?: string): Promise<Feature[]> {
    return this.featureService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Feature> {
    return this.featureService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateFeatureDto): Promise<Feature> {
    return this.featureService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFeatureDto,
  ): Promise<Feature> {
    return this.featureService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.featureService.remove(id);
  }
}
```

---

### Service template

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import type { Feature } from './interfaces/feature.interface';

@Injectable()
export class FeatureService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async findAll(userId?: string): Promise<Feature[]> {
    let query = this.client.from('features').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Feature[];
  }

  async findOne(id: string): Promise<Feature> {
    const { data, error } = await this.client
      .from('features')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    return data as Feature;
  }

  async create(createDto: CreateFeatureDto): Promise<Feature> {
    const { data, error } = await this.client
      .from('features')
      .insert(createDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feature: ${error.message}`);
    }

    return data as Feature;
  }

  async update(id: string, updateDto: UpdateFeatureDto): Promise<Feature> {
    const { data, error } = await this.client
      .from('features')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    return data as Feature;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client
      .from('features')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
  }
}
```

---

### DTO template

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}

export class UpdateFeatureDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
```

---

## ✅ Bonnes pratiques

### 1. Gestion des erreurs

```typescript
// ✅ Bon : Exceptions NestJS appropriées
async findOne(id: string): Promise<Board> {
  const { data, error } = await this.supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    throw new InternalServerErrorException('Database error');
  }

  return data as Board;
}

// ❌ Mauvais : Throw Error générique
async findOne(id: string) {
  const { data, error } = await this.supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Failed');
  return data;
}
```

**Exceptions NestJS :**
- `BadRequestException` (400) - Données invalides
- `UnauthorizedException` (401) - Non authentifié
- `ForbiddenException` (403) - Permissions insuffisantes
- `NotFoundException` (404) - Ressource introuvable
- `ConflictException` (409) - Conflit (ex: duplicate)
- `InternalServerErrorException` (500) - Erreur serveur

---

### 2. Validation avec DTOs

```typescript
// DTO avec validation
export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsUUID()
  user_id: string;
}

// Controller utilise automatiquement la validation
@Post()
create(@Body() createDto: CreateBoardDto) {
  // createDto est déjà validé ici
  return this.boardsService.create(createDto);
}
```

**Décorateurs de validation courants :**
- `@IsString()`, `@IsNumber()`, `@IsBoolean()`
- `@IsEmail()`, `@IsUUID()`, `@IsUrl()`
- `@IsNotEmpty()`, `@IsOptional()`
- `@Min()`, `@Max()`, `@MaxLength()`
- `@IsIn(['value1', 'value2'])`

---

### 3. Async/await

```typescript
// ✅ Bon : Async/await avec gestion d'erreur
async createBoard(board: CreateBoardDto): Promise<Board> {
  try {
    const { data, error } = await this.supabase
      .from('boards')
      .insert(board)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new InternalServerErrorException('Failed to create board');
  }
}

// ❌ Mauvais : Promises sans await
createBoard(board: CreateBoardDto): Promise<Board> {
  return this.supabase
    .from('boards')
    .insert(board)
    .select()
    .single()
    .then(({ data }) => data);
}
```

---

### 4. Dependency Injection

```typescript
// ✅ Bon : Injecter les dépendances
@Injectable()
export class BoardsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}
}

// ❌ Mauvais : Instancier directement
@Injectable()
export class BoardsService {
  private supabaseService = new SupabaseService();
}
```

---

### 5. Séparer logique métier et accès données

```typescript
// ✅ Bon : Service contient la logique
@Injectable()
export class BoardsService {
  async createBoardWithDefaults(userId: string): Promise<Board> {
    // Logique métier
    const board = await this.createBoard({
      title: 'Welcome Board',
      user_id: userId,
      color: '#4A90E2',
    });

    // Créer listes par défaut
    await this.createDefaultLists(board.id);

    return board;
  }

  private async createBoard(data: CreateBoardDto): Promise<Board> {
    // Accès données
    const { data: board, error } = await this.supabase
      .from('boards')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return board;
  }
}
```

---

## 🧪 Tests

### Structure des tests

```
src/
└── boards/
    ├── boards.service.ts
    ├── boards.service.spec.ts        # Tests unitaires
    ├── boards.controller.ts
    └── boards.controller.spec.ts     # Tests unitaires

test/
└── boards.e2e-spec.ts                # Tests E2E
```

---

### Tests unitaires - Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException } from '@nestjs/common';

describe('BoardsService', () => {
  let service: BoardsService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a board', async () => {
      const mockBoard = {
        id: '123',
        title: 'Test Board',
        user_id: 'user-123',
      };

      mockSupabaseService.getClient().single.mockResolvedValue({
        data: mockBoard,
        error: null,
      });

      const result = await service.findOne('123');

      expect(result).toEqual(mockBoard);
    });

    it('should throw NotFoundException if board not found', async () => {
      mockSupabaseService.getClient().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      });

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

### Tests E2E

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('BoardsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/boards (GET)', () => {
    return request(app.getHttpServer())
      .get('/boards')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/boards/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/boards/123')
      .expect(404);
  });

  it('/boards (POST)', () => {
    return request(app.getHttpServer())
      .post('/boards')
      .send({
        title: 'New Board',
        user_id: 'user-123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('New Board');
      });
  });
});
```

---

### Lancer les tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

---

## 🐛 Debugging

### Logs

```typescript
// ✅ Bon : Logger NestJS
import { Logger } from '@nestjs/common';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);

  async create(board: CreateBoardDto): Promise<Board> {
    this.logger.log(`Creating board: ${board.title}`);
    
    try {
      const result = await this.supabase.from('boards').insert(board);
      this.logger.log(`Board created: ${result.data.id}`);
      return result.data;
    } catch (error) {
      this.logger.error(`Failed to create board: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

**Niveaux de log :**
- `logger.log()` - Info générale
- `logger.debug()` - Debugging détaillé
- `logger.warn()` - Avertissements
- `logger.error()` - Erreurs

---

### Debugger VSCode

Créez `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

**Usage :**
1. Placer des breakpoints dans VSCode
2. F5 ou Run → Start Debugging
3. Tester l'endpoint
4. Le code s'arrête aux breakpoints

---

### Tester les endpoints

Utiliser les fichiers `.rest` :

`backend/api.rest` :
```http
### Get all boards
GET http://localhost:3000/boards
Content-Type: application/json

### Get board by ID
GET http://localhost:3000/boards/123
Content-Type: application/json

### Create board
POST http://localhost:3000/boards
Content-Type: application/json

{
  "title": "Test Board",
  "user_id": "user-123",
  "color": "#4A90E2"
}

### Update board
PUT http://localhost:3000/boards/123
Content-Type: application/json

{
  "title": "Updated Title"
}
```

**Extension VSCode :** REST Client

---

## 🔀 Git workflow

### Branches

```bash
main          # Production
  ↓
develop       # Développement principal
  ↓
feature/xxx   # Nouvelles fonctionnalités
bugfix/xxx    # Corrections de bugs
hotfix/xxx    # Corrections urgentes
```

### Workflow

```bash
# 1. Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/add-labels

# 2. Développer et commiter
git add .
git commit -m "feat: add labels module"

# 3. Pusher
git push origin feature/add-labels

# 4. Créer une Pull Request sur GitHub

# 5. Après review et CI pass, merger dans develop
```

---

### Convention de commits

Format : `type(scope): message`

**Types :**
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation
- `style` - Formatage (pas de changement de code)
- `refactor` - Refactoring
- `test` - Ajout de tests
- `chore` - Maintenance (deps, config)

**Exemples :**
```bash
feat(boards): add board creation endpoint
fix(auth): correct JWT validation
docs(readme): update installation steps
refactor(supabase): simplify client management
test(boards): add unit tests for BoardsService
chore(deps): upgrade NestJS to v11
```

---

## ⚡ Performance

### 1. Optimiser les requêtes Supabase

```typescript
// ❌ Mauvais : N+1 queries
const boards = await supabase.from('boards').select('*');
for (const board of boards) {
  const lists = await supabase.from('lists').select('*').eq('board_id', board.id);
  board.lists = lists;
}

// ✅ Bon : Join avec select nested
const boards = await supabase
  .from('boards')
  .select(`
    *,
    lists (
      *,
      cards (*)
    )
  `);
```

---

### 2. Utiliser des indexes

```sql
-- Créer des index pour les colonnes fréquemment filtrées
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
```

---

### 3. Limiter les données retournées

```typescript
// ❌ Mauvais : Retourne toutes les colonnes
const boards = await supabase.from('boards').select('*');

// ✅ Bon : Sélectionner uniquement les colonnes nécessaires
const boards = await supabase
  .from('boards')
  .select('id, title, color, updated_at');
```

---

### 4. Caching (optionnel)

Pour des données rarement modifiées :

```typescript
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class LabelsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findAll(boardId: string): Promise<Label[]> {
    const cacheKey = `labels:${boardId}`;
    
    // Check cache
    const cached = await this.cacheManager.get<Label[]>(cacheKey);
    if (cached) return cached;

    // Fetch from DB
    const { data } = await this.supabase
      .from('labels')
      .select('*')
      .eq('board_id', boardId);

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, data, 300);
    
    return data;
  }
}
```

---

## 🔒 Sécurité

### 1. Ne jamais exposer les secrets

```typescript
// ❌ Mauvais : Secret en dur
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// ✅ Bon : Variables d'environnement
const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
```

---

### 2. Valider toutes les entrées

```typescript
// ✅ Toujours utiliser des DTOs avec validation
@Post()
create(@Body() createDto: CreateBoardDto) {
  return this.boardsService.create(createDto);
}
```

---

### 3. Gérer les permissions

```typescript
// ✅ Vérifier que l'utilisateur a le droit
async update(id: string, userId: string, updateDto: UpdateBoardDto) {
  const board = await this.findOne(id);
  
  if (board.user_id !== userId) {
    throw new ForbiddenException('You do not own this board');
  }
  
  return this.updateBoard(id, updateDto);
}
```

---

### 4. Rate limiting (optionnel)

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // 60 secondes
      limit: 10,    // 10 requêtes max
    }),
  ],
})
export class AppModule {}
```

---

## 📚 Ressources complémentaires

- **[NestJS Documentation](https://docs.nestjs.com/)** - Documentation officielle
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Guide TypeScript
- **[Supabase Docs](https://supabase.com/docs)** - Documentation Supabase
- **[BACKEND.md](BACKEND.md)** - Architecture backend
- **[BACKEND-API.md](BACKEND-API.md)** - Documentation API
- **[BACKEND-MODULES.md](BACKEND-MODULES.md)** - Modules détaillés
- **[BACKEND-SUPABASE.md](BACKEND-SUPABASE.md)** - Intégration Supabase
