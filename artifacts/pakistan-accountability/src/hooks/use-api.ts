// Centralized wrapper for generated API hooks to simplify imports
export { 
  useGetStats as useStats,
  useListDatabases as useDatabases,
  useGetDatabase as useDatabase,
  useListOfficials as useOfficials,
  useGetOfficial as useOfficial,
  useGetOfficialConnections as useOfficialConnections,
  useListRiskScores as useRiskScores,
  useListAlerts as useAlerts
} from "@workspace/api-client-react";

export type {
  SystemStats,
  PublicDatabase,
  Official,
  OfficialDetail,
  ConnectionGraph,
  RiskScore,
  Alert
} from "@workspace/api-client-react/src/generated/api.schemas";
