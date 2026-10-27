import { Counter } from '@/components/Counter';
import { TaskModal } from '@/components/TaskModal';
import { formatPrice } from '@/lib/format';

export default function Home() {
  return (
    <main>
      <h1>Demo CI/CD</h1>
      <p>
        Este proyecto no permite <strong>push</strong> a <code>main</code> ni <strong>merge</strong>{' '}
        de un Pull Request si los tests fallan.
      </p>
      <p>Backend: NestJS + Jest · Frontend: Next.js + Jest · CI: GitHub Actions</p>
      <p>Precio de ejemplo: {formatPrice(199900)}</p>

      <div className="demo-grid">
        <Counter initialValue={0} />
        <TaskModal />
      </div>
    </main>
  );
}
