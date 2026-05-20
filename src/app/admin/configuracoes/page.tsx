'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Settings,
  UserPlus,
  Bell,
  ClipboardList,
  Shield,
  FileText,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { adminApi } from "@/lib/adminApi"
import type { AdminUser, AdminAuditEntry } from "@/types/admin"

// ---------- Page Component ----------

export default function ConfiguracoesPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [auditLog, setAuditLog] = useState<AdminAuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [notifications, setNotifications] = useState({
    novoCadastro: true,
    pagamentoRecebido: true,
    licencaExpirando: true,
    pagamentoAtrasado: false,
  })

  // Configuracao da cota de notas gratis (plano FREE)
  const [freeNotesQuota, setFreeNotesQuota] = useState<string>("")
  const [savingQuota, setSavingQuota] = useState(false)

  useEffect(() => {
    Promise.all([
      adminApi.get<AdminUser[]>("admin-users").catch(() => []),
      adminApi.get<AdminAuditEntry[]>("audit-log").catch(() => []),
      adminApi.get<{ freeNotesQuota: number }>("license-config").catch(() => null),
    ])
      .then(([users, audit, licenseConfig]) => {
        setAdminUsers(users)
        setAuditLog(audit)
        if (licenseConfig && typeof licenseConfig.freeNotesQuota === "number") {
          setFreeNotesQuota(String(licenseConfig.freeNotesQuota))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveQuota = async () => {
    const value = Number(freeNotesQuota)
    if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
      toast.error("Informe um número inteiro válido de notas grátis")
      return
    }
    setSavingQuota(true)
    try {
      await adminApi.put("license-config", { freeNotesQuota: value })
      toast.success("Cota de notas grátis atualizada")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar configuração"
      toast.error(message)
    } finally {
      setSavingQuota(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
          <p className="text-sm text-gray-500">Gerencie admins, notificações e auditoria</p>
        </div>
      </div>

      {/* Plano FREE - Cota de notas gratis */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Plano Grátis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 max-w-xs space-y-2">
              <Label htmlFor="freeNotesQuota" className="text-sm font-semibold text-gray-800">
                Notas grátis por mês
              </Label>
              <Input
                id="freeNotesQuota"
                type="number"
                min={0}
                step={1}
                value={freeNotesQuota}
                onChange={(e) => setFreeNotesQuota(e.target.value)}
                placeholder="Ex: 5"
              />
              <p className="text-xs text-gray-500">
                Quantidade de notas que cada conta no plano grátis pode emitir por mês.
              </p>
            </div>
            <Button
              onClick={handleSaveQuota}
              disabled={savingQuota}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg"
            >
              {savingQuota ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              Usuarios Administradores
            </CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-800">{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={`border-0 text-xs ${
                        user.role === "SUPER_ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`border-0 text-xs ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <Bell className="w-4 h-4 text-white" />
            </div>
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">Novo cadastro</p>
                <p className="text-xs text-gray-500 mt-0.5">Receba notificação quando uma nova empresa se cadastrar</p>
              </div>
              <Switch
                checked={notifications.novoCadastro}
                onCheckedChange={() => toggleNotification("novoCadastro")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">Pagamento recebido</p>
                <p className="text-xs text-gray-500 mt-0.5">Notificacao ao receber um novo pagamento</p>
              </div>
              <Switch
                checked={notifications.pagamentoRecebido}
                onCheckedChange={() => toggleNotification("pagamentoRecebido")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">Licenca expirando</p>
                <p className="text-xs text-gray-500 mt-0.5">Alerta quando uma licenca estiver prestes a expirar</p>
              </div>
              <Switch
                checked={notifications.licencaExpirando}
                onCheckedChange={() => toggleNotification("licencaExpirando")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">Pagamento atrasado</p>
                <p className="text-xs text-gray-500 mt-0.5">Alerta quando um pagamento estiver em atraso</p>
              </div>
              <Switch
                checked={notifications.pagamentoAtrasado}
                onCheckedChange={() => toggleNotification("pagamentoAtrasado")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            Log de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Data/Hora</TableHead>
                <TableHead className="font-semibold text-gray-700">Admin</TableHead>
                <TableHead className="font-semibold text-gray-700">Acao</TableHead>
                <TableHead className="font-semibold text-gray-700">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="text-gray-600 text-sm whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleDateString("pt-BR")}{" "}
                    {new Date(entry.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="font-medium text-gray-800">{entry.admin}</TableCell>
                  <TableCell>
                    <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">{entry.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
