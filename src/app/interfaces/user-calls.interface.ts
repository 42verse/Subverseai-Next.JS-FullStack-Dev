export enum Time {
  ALL = "All",
  TODAY = "Today",
  THIS_MONTH = "This month",
}

export enum Dispositions {
  CUSTOMER_HANGUP = "Customer Hangup",
  NOT_INTERESTED = "Not interested",
  CALLBACK_REQUESTED = "Call back requested",
  LEAD_GENERATED = "Lead generated",
  WRONG_NUMBER = "Wrong number",
  FAKE_LEAD = "Fake lead",
  BOUGHT_OTHER_POLICY = "Bought other policy",
}

export enum LeadStatuses {
  NOT_INTERESTED = "Not interested",
  ASKED_TO_CALL_BACK = "Asked to call back",
  INTEREST_SHOWN = "Interest shown",
  DOCUMENTS_SHARED = "Documents shared",
  PAYMENT_DONE = "Payment done",
}

export enum CallStatuses {
  CALL_ANSWERED = "Call Answered",
  COULD_NOT_CONNECT = "Couldn't Connect",
  DID_NOT_PICK_UO = "Didn't pick up",
  CALL_REJECTED = "Call Rejected",
  CALL_PENDING_WHEN_EMPTY = "Call Pending when empty",
}

export enum PresentationGiven {
  YES = "Yes",
  NO = "No",
}
