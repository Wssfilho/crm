import { Outlet } from 'react-router-dom';
import { ExportarCsvDialog } from '@/components/crm/exportar-csv-dialog';
import { NovoClienteDialog } from '@/components/crm/novo-cliente-dialog';
import { Sidebar } from '@/components/crm/sidebar';
import { Topbar } from '@/components/crm/topbar';
import { TriagemProvider } from '@/contexts/triagem-provider';

export function AppLayout() {
  return (
    <TriagemProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <div className="flex-1 overflow-y-auto px-[30px] pt-6 pb-11">
            <Outlet />
          </div>
        </div>
      </div>

      <ExportarCsvDialog />
      <NovoClienteDialog />
    </TriagemProvider>
  );
}
