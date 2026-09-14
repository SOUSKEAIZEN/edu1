export interface RiskThresholds {
  academic: {
    minimumPassingAverage: number;
    suddenDropThreshold: number; // e.g., 15% drop
  };
  attendance: {
    institutionalMinimum: number;
    suddenDropThreshold: number;
  };
  deadlines: {
    maxOverdueAllowed: number;
  };
  goals: {
    minimumProgressExpected: number; // e.g., 20%
  };
}

export const defaultRulesV1: RiskThresholds = {
  academic: {
    minimumPassingAverage: 50,
    suddenDropThreshold: 15,
  },
  attendance: {
    institutionalMinimum: 75,
    suddenDropThreshold: 15,
  },
  deadlines: {
    maxOverdueAllowed: 2,
  },
  goals: {
    minimumProgressExpected: 10,
  }
};
