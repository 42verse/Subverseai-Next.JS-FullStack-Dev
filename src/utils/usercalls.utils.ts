import { ELeadStatuses } from "@/app/interfaces/user-calls.interface";

export const activeLeadStatusesEnumValues = Object.values(ELeadStatuses).filter(status => status !== ELeadStatuses.NOT_INTERESTED);

export const activeLeadStatusValues = activeLeadStatusesEnumValues.map(status => status.replace(/_/g,' '))