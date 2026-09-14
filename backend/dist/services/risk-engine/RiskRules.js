"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRulesV1 = void 0;
exports.defaultRulesV1 = {
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
