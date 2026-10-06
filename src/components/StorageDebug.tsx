/**
 * Componente para debug de storage
 * Mostra qual storage está sendo usado (IndexedDB ou localStorage)
 * Útil para desenvolvimento e troubleshooting
 */

import { useEffect, useState } from 'react';
import { dosesDB } from '@/utils/indexeddb';
import { useStorageDebug } from '@/utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StorageDebug = () => {
  const [dbStatus, setDbStatus] = useState<{
    available: boolean;
    count: number;
  }>({ available: false, count: 0 });

  const { errors, lastError } = useStorageDebug();

  useEffect(() => {
    const check = async () => {
      const isAvailable = dosesDB.isAvailable();
      const count = isAvailable ? await dosesDB.count() : 0;
      setDbStatus({ available: isAvailable, count });
    };

    check();
    const interval = setInterval(check, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full bg-slate-50">
      <CardHeader>
        <CardTitle className="text-sm">Storage Status</CardTitle>
        <CardDescription>Sistema de armazenamento</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* IndexedDB Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">IndexedDB</span>
          <div className="flex items-center gap-2">
            <Badge variant={dbStatus.available ? 'default' : 'secondary'}>
              {dbStatus.available ? '✅ Ativo' : '⚠️ Fallback'}
            </Badge>
            {dbStatus.available && <span className="text-xs text-gray-600">{dbStatus.count} registros</span>}
          </div>
        </div>

        {/* localStorage Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">localStorage Errors</span>
              <Badge variant="destructive" className="text-xs">
                {errors.length}
              </Badge>
            </div>

            {lastError && (
              <div className="bg-red-50 p-3 rounded text-xs text-red-800">
                <p className="font-semibold">{lastError.key}</p>
                <p className="text-red-700">{lastError.error}</p>
                <p className="text-red-600 text-xs mt-1">
                  {new Date(lastError.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Storage Tips */}
        <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
          <p className="font-semibold mb-1">💡 Storage Info:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>IndexedDB: Ilimitado, mais rápido para grandes volumes</li>
            <li>localStorage: ~5-10MB, fallback automático</li>
            <li>Sincronização automática entre os dois</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageDebug;
