export enum ETimeFilter {
  ALL = "all",
  TODAY = "today",
  THIS_MONTH = "this_month",
}

export enum ECallDispositions {
  ALL = "all",
  CUSTOMER_HANGUP = "customer_hangup",
  NOT_INTERESTED = "not_interested",
  CALLBACK_REQUESTED = "call_back_requested",
  LEAD_GENERATED = "lead_generated",
  WRONG_NUMBER = "wrong_number",
  FAKE_LEAD = "fake_lead",
  BOUGHT_OTHER_POLICY = "bought_other_policy",
}

export enum ELeadStatuses {
  NOT_INTERESTED = "not_interested",
  ASKED_TO_CALL_BACK = "asked_to_call_back",
  INTEREST_SHOWN = "interest_shown",
  DOCUMENTS_SHARED = "documents_shared",
  PAYMENT_DONE = "payment_done",
}

export enum ECallStatuses {
  ALL = "all",
  CALL_ANSWERED = "call_answered",
  COULD_NOT_CONNECT = "couldn't_connect",
  DID_NOT_PICK_UP = "didn't_pick_up",
  CALL_REJECTED = "call_rejected",
  CALL_PENDING = "call_pending",
}

export enum EPresentationGiven {
  YES = "yes",
  NO = "no",
}
