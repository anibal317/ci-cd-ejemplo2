# CI/CD bloqueante: nada se mergea si los tests fallan

Ejemplo mínimo pero completo de un pipeline que **impide hacer push a `main` y mergear un Pull Request cuando los tests fallan**.

- `backend/` → API de tareas con **NestJS + Jest**
- `frontend/` → App con **Next.js + Jest + Testing Library**
- `.github/workflows/ci.yml` → pipeline de **GitHub Actions**
- `.githooks/pre-push` → bloqueo local antes de subir commits
- `scripts/protect-main.sh` → configura la protección de rama con `gh`

> Sobre JUnit: JUnit es el framework de testing de Java. En el ecosistema Node/TypeScript el equivalente es **Jest**, que es lo que se usa aquí en ambos proyectos (unitarios, integración y e2e).

---

## Estructura

```
.
├── .github/workflows/ci.yml         # Pipeline: tests BE + FE y job "CI OK"
├── .githooks/pre-push               # Hook local: corre los tests antes del push
├── .gitattributes                   # LF consistente (Windows + Linux)
├── .nvmrc                           # Node 22
├── package.json                     # Scripts de raíz: dev, test, build
├── backend/                         # NestJS + Swagger + Jest
│   ├── src/tasks/tasks.service.ts
│   ├── src/tasks/tasks.service.spec.ts       # Test unitario del servicio
│   ├── src/tasks/tasks.controller.spec.ts    # Test unitario del controlador
│   ├── src/tasks/dto/                        # DTOs documentados con @ApiProperty
│   ├── src/swagger.ts                        # Configuración de Swagger/OpenAPI
│   └── test/app.e2e-spec.ts                  # Test e2e (HTTP real + /docs-json)
├── frontend/                        # Next.js (App Router) + Jest
│   ├── components/Counter.tsx
│   ├── components/Counter.test.tsx           # Test de componente
│   ├── components/TaskForm.tsx               # Formulario (ejercicio con TODOs)
│   ├── components/TaskForm.test.tsx          # 2 tests en rojo a propósito
│   ├── components/Modal.tsx                  # Modal accesible reutilizable
│   ├── components/Modal.test.tsx             # Apertura/cierre y accesibilidad
│   ├── components/TaskModal.tsx              # Demo visual: botón + modal + lista
│   ├── components/TaskModal.test.tsx         # Integración Modal + TaskForm
│   ├── lib/format.test.ts                    # Test de utilidad
│   └── app/page.test.tsx                     # Test de página
└── scripts/
    ├── dev.mjs                      # Levanta backend + frontend a la vez
    └── protect-main.sh              # Branch protection vía GitHub CLI
```

## Requisitos

- Node.js **22 o superior** (probado con 22 y 24)
- npm 10+
- Git

## Puesta en marcha

### Opción rápida: los dos servidores a la vez

Desde la raíz del repo:

```bash
npm run install:all   # solo la primera vez
npm run dev
```

`npm run dev` ejecuta `scripts/dev.mjs`, que:

- arranca NestJS (`backend`) y Next.js (`frontend`) en paralelo,
- prefija cada línea con `[back]` o `[front]`,
- detiene ambos con `Ctrl+C`,
- si uno falla o termina, apaga el otro para no dejarlo huérfano.

```
  back  → http://localhost:3001/tasks
          Swagger: http://localhost:3001/docs
  front → http://localhost:3000
```

### Scripts de la raíz

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta backend y frontend juntos |
| `npm run install:all` | `npm install` en `backend/` y `frontend/` |
| `npm run test` | Unitarios + e2e del backend y tests del frontend |
| `npm run typecheck` | TypeScript del frontend |
| `npm run build` | Build de producción de ambos |

### Por separado

```bash
# Backend
cd backend
npm install
npm run start:dev        # http://localhost:3001/tasks

# Frontend (otra terminal)
cd frontend
npm install
npm run dev              # http://localhost:3000
```

## Primer push al repositorio

```bash
git add .
git commit -m "feat: ejemplo de CI/CD con tests bloqueantes"
git branch -M main
git remote add origin git@github.com:<usuario>/<repo>.git
git push -u origin main

# Después del primer push y de que el workflow se haya ejecutado una vez:
git config core.hooksPath .githooks
./scripts/protect-main.sh
```

> Configura la protección **después** del primer push: si `main` ya exige PR y checks, ese primer push directo sería rechazado.

## Ejecutar los tests

| Proyecto | Comando | Qué ejecuta |
| --- | --- | --- |
| Backend | `npm test` | Unitarios (`*.spec.ts`) |
| Backend | `npm run test:e2e` | API real con `supertest` |
| Backend | `npm run test:ci` | Unitarios + cobertura, modo CI |
| Frontend | `npm test` | Jest + Testing Library |
| Frontend | `npm run test:ci` | Tests + cobertura, modo CI |
| Frontend | `npm run typecheck` | `tsc --noEmit` |

### Mapa de tests: qué se prueba y dónde está

**Backend** (`backend/`):

| Qué se prueba | Dónde está | Tipo |
| --- | --- | --- |
| Lógica de negocio de las tareas (`create`, `findAll`, `toggle`, errores) | `src/tasks/tasks.service.spec.ts` | Unitario |
| Controlador aislado: delega bien en el servicio y propaga errores | `src/tasks/tasks.controller.spec.ts` | Unitario |
| API real por HTTP: rutas, status 200/201/400/404, body y Swagger | `test/app.e2e-spec.ts` | e2e |

**Frontend** (`frontend/`):

| Qué se prueba | Dónde está | Tipo |
| --- | --- | --- |
| Componente `<Counter />`: render, clics, valores negativos y reinicio | `components/Counter.test.tsx` | Componente |
| Componente `<TaskForm />`: validación de vacío y recorte de espacios (2 tests en rojo hasta resolver los TODOs) | `components/TaskForm.test.tsx` | Componente |
| Componente `<Modal />`: apertura/cierre, Escape, clic en el fondo y título accesible | `components/Modal.test.tsx` | Componente |
| `<TaskModal />`: abrir el modal, crear una tarea y verla en la lista | `components/TaskModal.test.tsx` | Componente (integración) |
| Utilidad `formatPrice`: formato, decimales, negativos y errores | `lib/format.test.ts` | Unitario |
| Página de inicio: textos, precio y que monta el contador | `app/page.test.tsx` | Componente |

**Convención de nombres** (los tests viven junto al código que prueban):

- `*.spec.ts` → unitario de backend, en la misma carpeta que el `.ts`.
- `*.e2e-spec.ts` → e2e de backend, en `backend/test/`.
- `*.test.tsx` / `*.test.ts` → frontend, junto al componente o utilidad.
- Cada archivo empieza con un bloque `¿QUÉ SE TESTEA AQUÍ?` y cada caso sigue el patrón **Arrange → Act → Assert**.

Ejecutar un único archivo:

```bash
cd backend && npx jest tasks.controller.spec.ts
cd backend && npx jest --config ./test/jest-e2e.json app.e2e-spec.ts
cd frontend && npx jest Counter.test.tsx
```

---

## Documentación de la API (Swagger)

Con el backend en marcha:

- UI interactiva: <http://localhost:3001/docs>
- OpenAPI en JSON: <http://localhost:3001/docs-json>

Los endpoints están anotados con `@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc., y los DTOs con `@ApiProperty`. La configuración vive en `src/swagger.ts` y se reutiliza en los tests e2e, que comprueban que `/docs-json` responde y contiene los endpoints esperados.

## Las 3 capas de bloqueo

### 1) Local: hook `pre-push`

Evita que subas código con tests rojos **antes** de llegar a GitHub:

```bash
git config core.hooksPath .githooks

# En Linux/macOS, dar permisos de ejecución:
chmod +x .githooks/pre-push scripts/protect-main.sh
# (o) git update-index --chmod=+x .githooks/pre-push
```

A partir de ahí, `git push` ejecuta los tests de backend (unitarios + e2e) y frontend y aborta si alguno falla.

> Se puede saltar con `git push --no-verify`. Por eso el hook es solo la primera red de seguridad: la barrera real está en GitHub.

### 2) Remoto: GitHub Actions

`.github/workflows/ci.yml` se dispara en cada `push` a `main` y en cada Pull Request:

```
backend  → npm ci → build → tests unitarios → tests e2e
frontend → npm ci → typecheck → tests → next build
                              ↓
                       job "CI OK"  ← required check
```

El job **`CI OK`** solo pasa si `backend` y `frontend` han terminado en `success`. Es el nombre que se exige en la protección de rama, así que añadir jobs futuros no obliga a tocar la configuración de GitHub.

### 3) GitHub: protección de la rama `main`

Con `gh` autenticado (`gh auth login`) y el workflow ejecutado al menos una vez:

```bash
./scripts/protect-main.sh
# o indicando el repo:
./scripts/protect-main.sh mi-usuario/mi-repo
```

El script aplica:

- ✅ Require a pull request before merging (0 aprobaciones por defecto, para que puedas mergear tú solo en la demo; súbelo a 1 en `scripts/protect-main.sh` si trabajáis en equipo)
- ✅ Require status checks to pass → **`CI OK`**
- ✅ Require branches to be up to date before merging
- ✅ Include administrators (ni el dueño puede saltárselo)
- ✅ Required conversation resolution
- ❌ Force pushes y borrado de la rama, bloqueados

También se puede hacer desde la UI: **Settings → Branches → Add branch protection rule** para `main`, marcando *Require a pull request before merging* y *Require status checks to pass*, y seleccionando **`CI OK`**.

> En Windows ejecuta el script desde **Git Bash**. La protección de rama necesita un repositorio público o un plan de GitHub que la incluya (Pro/Team/Enterprise).

Resultado:

| Acción | Sin tests OK |
| --- | --- |
| `git push origin main` directo | ❌ Rechazado (la rama exige PR) |
| Push a una rama feature | ✅ Permitido (el hook local lo frena si falla) |
| Merge del Pull Request | ❌ Botón de merge bloqueado |

---

## Cómo comprobar que funciona

1. Crea una rama y rompe un test a propósito:

   ```bash
   git switch -c feat/romper-test
   ```

2. En `backend/src/tasks/tasks.service.spec.ts` cambia por ejemplo:

   ```diff
   -    expect(task.done).toBe(false);
   +    expect(task.done).toBe(true);
   ```

3. Intenta subir la rama:

   ```bash
   git commit -am "test: romper el pipeline"
   git push -u origin feat/romper-test
   ```

   El hook `pre-push` corta el push. Si lo saltas con `--no-verify`, el push sube pero el PR queda con **CI OK en rojo** y GitHub no permite mergear.

4. Arregla el test, vuelve a subir y verás cómo `CI OK` se pone en verde y el merge se desbloquea.

---

## Detalles técnicos

- **NestJS 11 + Jest 30**: Nest 12 pasó a ESM y su plantilla oficial usa Vitest; para mantener el ejemplo con Jest sobre CommonJS (la combinación más extendida y sencilla de explicar) se fija la major 11.
- **Swagger**: `@nestjs/swagger` 11 monta `/docs` y `/docs-json`. La config se excluye de cobertura (es setup, no lógica) y se valida desde el test e2e.
- **`ts-jest`** compila TypeScript al vuelo; los tests e2e usan `supertest` contra la app real.
- **Next.js 16 + `next/jest`**: usa SWC para transformar TS/TSX y `jest-environment-jsdom` para los tests de componentes.
- **Cobertura**: ambos proyectos generan `coverage/` y el workflow lo publica como artefacto.
- **`concurrency`** cancela ejecuciones antiguas del mismo PR para no gastar minutos.
