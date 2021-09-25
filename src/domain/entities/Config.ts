import _ from "lodash";
import { Maybe, recordOf } from "../../utils/ts-utils";
import { Ref, NamedRef, Id, CodedRef, Code } from "./Base";
import { Constant } from "./Constant";
import { DataElement } from "./DataElement";
import { DataForm } from "./DataForm";
import { OrgUnit } from "./OrgUnit";

export interface Config {
    constants: Record<Id, Constant>;
    dataElements: DataElement[];
}

/*
const summaryDataElements = {
    coachingGrant: "DEA_Country Grant - # Coaching Grant",
    coachingTransport: "DEA_Country Grant - # Coaching Transport",
    coachingFood: "DEA_Country Grant - # Coaching Food",
    coachingLodging: "DEA_Country Grant - # Coaching Lodging",
    coachingAdministration: "DEA_Country Grant - # Coaching Administration",

    trainingGrant: "DEA_Country Grant - # Training Grant",
    trainingTransport: "DEA_Country Grant - # Training Transport",
    trainingVisionMeetingSnacks: "DEA_Country Grant - # Training Vis Meeting Snacks",
    trainingOCCTrainingMeals: "DEA_Country Grant - # Training OCC Training Meals",
    trainingAdministration: "DEA_Country Grant - # Training Administration",

    totalTeamGik: "DEA_Country Grant - Total Team GIK",
    totalTeamGrant: "DEA_Country Grant - Total Team Grant",
};

const materializedDataElements = {
    mpNeeded: "DEA_Country Grant - # of MP needed",
    teachersNeeded: "DEA_Country Grant - # of Teachers needed",
    trainersNeededPerEvent: "DEA_Country Grant - # of trainers needed p",
    visionMeetings: "DEA_Country Grant - # of vision meetings",
    trainingEvents: "DEA_Country Grant - # Training Events",
    vtgTeachers: "DEA_Country Grant - # VTG Teachers",
    attendanceAtTrainings: "DEA_Country Grant - # attendance at trainings",
    attendanceAtVisionMeetings: "DEA_Country Grant - # attendanc visi meet",
};

export const calculatedDataElements = {
    ...summaryDataElements,
    ...materializedDataElements,
};

const entities = {
    gdp: {
        dataElements: {
            reportingStatus: "DEA_Reporting Status",
            dateLastData: "DEA_Date when the last data should arrive",
            gdp: "GDP",
            tgjEnrollmentGoalPercent: "DEA_TGJ Enrollment Goal Percent",
            tgjEnrollmentGoal: "DEA_TGJ Enrollment Goal",
        },
        indicators: {},
        access: {
            userGroup: "GDP_TGJ_PLANNING",
        },
    },
    template: {
        // TODO: generate instead from API with type info {[dataElementCode]: {type: "NUMBER"}}
        dataElements: {
            valuesThatGrow: "DEA_Country Grant Template_Will Values that Grow",
            tgjClassSize: "DEA_Country Grant Template - TGJ Class size",
            maxAttendancePerTraining: "DEA_Country Grant Template - Max. # attendance per",
            conversionLocalPerUSD: "DEA_Country Grant Template - Currency Conversion",
            coachingTrips: "DEA_Country Grant Template- # of Coaching trips p",
            trainingEventMealPerPerson: "DEA_Country Grant Template - Training Event Meal/p",
            extraMPAttendance: "DEA_Country Grant Template - % of extra MP atten",
            phoneCopyPerMP: "DEA_Country Grant Template - Amn (phon/cop) MP",
            visionMeetingSnacks: "DEA_Country Grant Template - Vision Meeting Snacks",
            costPerTeamMember: "DEA_Country Grant Template - Admin: Local per team",
            trainerEventTransportCost: "DEA_Country Grant Template - Trainer/Leader Event",
        },
        indicators: {
            tgjPercentGiftBoxes: "IA_Country Grant Template - TGJ % of Giftboxes",
            tgjEnrollment: "IA_Country Grant Template - TGJ enrollment",
            teachersNeeded: "IA_Country Grant Template - # of Teachers needed",
            attendanceOfTrainings: "IA_Country Grant Template - # attendance at traini",
            trainingEvents: "IA_Country Grant Template - # Training Events",
        },
    },
    teams: {
        dataElements: {
            conversionLocalPerUSD: "DEA_Country Grant - Currency Conversion",
            inheritTemplate: "DEA_Country Grant - Inherit Template",
            valuesThatGrow: "DEA_Country Grant - Will Values that Grow (VTG) be",
            tgjClassSize: "DEA_Country Grant - TGJ Class size",
            extraMPAttendance: "DEA_% of extra MP attendance at vision meeting",
            trainingEventMealPerPerson: "DEA_Country Grant - Training Event Meal per person",
            visionMeetingSnacks: "DEA_Vision Meeting Snacks per person (Local)",
            coachingTrips: "DEA_Country Grant - # of Coaching trips per coac",
            giftboxes: "DEA_Country Grant - Giftboxes",
            tgjGiftboxesPercent: "DEA_Country Grant_TGJ % of Giftboxes",
            tgjGiftboxes: "DEA_Country Grant_TGJ of Giftboxes",
            phoneCopyPerMP: "DEA_Country Grant - Admin(phone/copy) per MP Local",
            trainerEventTransportCost: "DEA_Trainer/Leader Event Transport amount/person",
            ntlOnlyFunds: "DEA_Country Grant - NLT only funds (e.g., NGOs)",
            maxAttendancePerTraining: "DEA_Country Grant - Max. # attendance training",
            vtgEnrollment: "DEA_Country Grant - VTG Enrollment",
            vtgEnrollmentPercent: "DEA_Country Grant - VTG Enrollment %",
            teamsCoached: "DEA_Country Grant - # Teams Coached (child teams)",
            activeVolunteers: "DEA_Country Grant - Active volunteers",
            ...calculatedDataElements,
            teamTransportLocalPerPerson: "DEA_Country Grant - Team Transport: Local per pers",
            teamFoodLocalPerPerson: "DEA_Country Grant - Team Food: Local per person pe",
            teamLodgingLocalPerPerson: "DEA_Country Grant - Team Lodging: Local per person",
            adminLocalPerTeamMember: "DEA_Country Grant - Admin: Local per team member",
            teamTransportGikLocal: "DEA_Team GRANT - Team Transport GIK (LOCAL)",
            teamFoodGikLocal: "DEA_Team GRANT - Team Food GIK (LOCAL)",
            teamLodgingGikLocal: "DEA_Team GRANT - Team Lodging GIK (LOCAL)",
            teamAdminPhoneAndMiscGik: "DEA_Team Admin Phone, Photocopying, etc. GIK",
            transportGikLocal: "DEA_Team GRANT - Transport GIK (LOCAL)",
            visionMeetingSnacksGikLocal: "DEA_Team GRANT - Vision Meeting snacks GIK (Local)",
            trainingEventMealsGikLocal: "DEA_Team GRANT - Training Event meals GIK (Local)",
            adminPhoneAndMiscGikLocal: "DEA_Admin Phone, photocopying, etc. GIK (LOCAL)",
            maxAttendancePerVisionMeeting: "DEA_Max # attendance per vision meeting",
            giftboxesPerMp: "DEA_Country Grant - Giftboxes per MP (churches)",
        },
        indicators: {
            giftBoxesCountryLevel: "IA_Country Grant - Giftboxes at the country level",
            mpNeededIfNoGitboxes: "IA_Country Grant - # of MP needed - no-giftboxes",
            tgjAtCountryLevelActual: "IA_Country Grant - TGJ at country (actual)",
            tgjAtCountryLevelTarget: "IA_Country Grant - TGJ at country (target)",
            giftBoxesAtCountryLevelTarget: "IA_Country Grant - Giftboxes at country (target)",
            coachingGrant: "IA_Country Grant - # Coaching Grant",
            totalTeamGik: "IA_Country Grant - Total Team GIK",
            totalTeamGrant: "IA_Country Grant - Total Team Grant",
            trainingGrant: "IA_Country Grant - # Training Grant",
            mpNeeded: "IA_Country Grant - # of MP needed",
            attendanceVisionMeeting: "IA_Country Grant - # attendanc visi meet",
            visionMeetings: "IA_Country Grant - # of vision meetings",
            teachersNeeded: "IA_Country Grant - # of Teachers needed",
            vtgTeachers: "IA_Country Grant - # VTG Teachers",
            attendanceTrainings: "IA_Country Grant - # attendance at trainings",
            trainersNeeded: "IA_Country Grant - # of trainers needed p",
            trainingEvents: "IA_Country Grant - # Training Events",
        },
        sqlViews: {
            aggregateByCountry: "Aggregate by Country",
        },
    },
    volunteers: {
        program: "VOLUNTEERS",
        dataElementActiveName: "Active (Volunteers)",
    },
    constants: {
        prayerEvents: "CS_# of Prayer events",
        giftboxesPerContainer: "CS_Giftboxes per container",
    },
};

export const constants = {
    countryLevel: 4,
    attributeIndicatorPosition: "AT_Indicator Position",
    attributeMaterializedCode: "AT_MATERIALIZED_DATA_ELEMENT",
    dataElementGroupMateralizedCode: "COUNTRY_GRANT_MATERIALIZED",
    globalDistributionPlan: {
        dataSetCode: "DS_GDP-TGJ",
        entities: entities.gdp,
        indicators: [],
    },
    pivotTables: { summary: { name: "Country Grant Summary" } },
    countryGrant: {
        dataSetTeamsCode: {
            nlt: "DS_Country Grant Dataset 21-22",
            srlt: "DS_Country Grant Dataset 21-22",
            rlt: "DS_Country Grant Dataset 21-22",
        } as ForTeams<Code>,
        dataSetTemplateCode: "DS_Country Grant Template Dataset 21-22",
        dataElementGroupInheritTemplateCode: "DEG_Country Grant - Inherit Template",
        dataElementGroupTeamsCoachedCode: "DEG_Country Grant - # Teams Coached (child teams)",
        attributeInheritedDataElementCode: "AT_Paired Data Element",
        dataElementGroupActiveVolunteers: "DEG_Country Grant - Active volunteers",
        indicators: recordOf<IndicatorDefinition[]>()({
            template: [
                { type: "custom", code: entities.template.indicators.tgjPercentGiftBoxes },
                { type: "custom", code: entities.template.indicators.teachersNeeded },
                { type: "custom", code: entities.template.indicators.attendanceOfTrainings },
                { type: "custom", code: entities.template.indicators.trainingEvents },
            ],
            teams: [
                {
                    type: "sqlView",
                    code: entities.teams.indicators.giftBoxesCountryLevel,
                    sqlViewName: entities.teams.sqlViews.aggregateByCountry,
                },
                {
                    type: "sqlView",
                    code: entities.teams.indicators.tgjAtCountryLevelActual,
                    sqlViewName: entities.teams.sqlViews.aggregateByCountry,
                },
                {
                    type: "custom",
                    code: entities.teams.indicators.tgjAtCountryLevelTarget,
                    orgUnitLevel: "template",
                },
                {
                    type: "custom",
                    code: entities.teams.indicators.giftBoxesAtCountryLevelTarget,
                    orgUnitLevel: "template",
                },
            ],
        }),
        entities,
        indicatorsToMaterialize: [
            entities.teams.indicators.coachingGrant,
            entities.teams.indicators.totalTeamGik,
            entities.teams.indicators.totalTeamGrant,
            entities.teams.indicators.trainingGrant,
            entities.teams.indicators.mpNeeded,
            entities.teams.indicators.attendanceVisionMeeting,
            entities.teams.indicators.visionMeetings,
            entities.teams.indicators.teachersNeeded,
            entities.teams.indicators.vtgTeachers,
            entities.teams.indicators.attendanceTrainings,
            entities.teams.indicators.trainersNeeded,
            entities.teams.indicators.trainingEvents,
        ],
    },
    volunteers: { entities: entities.volunteers },
};

export interface Config {
    currentUser: CurrentUser;
    organisationUnits: {
        root: NamedRef;
    };
    categoryOptionCombos: {
        default: Ref;
    };
    globalDistributionPlan: {
        dataForm: DataForm;
    };
    dataElements: CodedRef[];
    indicators: CodedRef[];
    sqlViews: NamedRef[];
    pivotTables: {
        summary: Ref;
    };
    constants: Record<Id, Constant>;
    countryGrant: {
        teamDataForms: ForTeams<DataForm>;
        templateDataForm: DataForm;
        dataElementGroupInheritTemplate: Ref;
        dataElementGroupTeamsCoached: Ref;
        dataElementGroupActiveVolunteers: Ref;
        inheritedDataElements: Record<TemplateDataElementId, TeamDataElementId>;
        dataElementInheritTemplate: Ref;
        dataElementGroupMateralized: Ref;
    };
    volunteers: {
        program: Ref;
        dataElementActive: Ref;
    };
}

type TemplateDataElementId = Id;
type TeamDataElementId = Id;

export type DataFormType = "gdp" | "country-grant";

export type IndicatorDefinition = StandardIndicatorDefinition | CustomIndicatorDefinition | SqlViewIndicatorDefinition;

interface StandardIndicatorDefinition {
    type: "standard";
    code: Code;
}

interface CustomIndicatorDefinition {
    type: "custom";
    code: Code;
    orgUnitLevel?: "current" | "template";
}

interface SqlViewIndicatorDefinition {
    type: "sqlView";
    code: Code;
    sqlViewName: Id;
}

export type ForTeams<T> = Record<"nlt" | "srlt" | "rlt", T>;

export function getDataForm(options: { type: DataFormType; orgUnit: Maybe<OrgUnit>; config: Config }): Maybe<DataForm> {
    const { type, orgUnit, config } = options;

    switch (type) {
        case "gdp":
            return config.globalDistributionPlan.dataForm;
        case "country-grant":
            if (!orgUnit) return;

            switch (orgUnit.level) {
                case 4:
                    return config.countryGrant.templateDataForm;
                case 5:
                    return config.countryGrant.teamDataForms.nlt;
                case 6:
                    return config.countryGrant.teamDataForms.srlt;
                case 7:
                    return config.countryGrant.teamDataForms.rlt;
                default:
                    return;
            }
    }
}
*/
