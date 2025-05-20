    // mock/procurement-data.ts

    export const PROCUREMENT_DATA = {
        metadata: {
        fiscalYear: 2022,
        quarter: 4,
        preparedBy: {
            name: "AILEEN A. MANICANI",
            position: "Acting BAC Secretary",
            role: "Preparer"
        },
        approvedBy: {
            name: "MARILYN D. CARDOSO, Ph. D.",
            position: "University President",
            role: "Approver"
        },
        committeeMembers: [
            { name: "ARTHUR L. POBLETE, LLB", position: "Vice Chair, BAC", role: "Committee Member" },
            { name: "RICARDO T. SEVERO, JR., Ph. D.", position: "Member, BAC", role: "Committee Member" },
            { name: "ENGR. MEDDY S. MANGARING", position: "Member, BAC", role: "Committee Member" },
            { name: "ENGR. MIRADOR G. LABRADOR", position: "Member, BAC", role: "Committee Member" },
            { name: "GINA U. ESPAÑO, Ph. D.", position: "Chair, BAC", role: "Committee Member" }
        ],
        dateApproved: new Date("2022-12-27"),
        fundingSource: "RAF-CO"
        },
        categories: [
        {
            name: "MACHINERIES / EQUIPMENT OUTLAY",
            code: "ME",
            fund: "RAF-CO",
            items: [
            {
                id: "2025-01-01ABC",
                code: "",
                program: "Laboratory Equipment (Supply and Delivery of Technical and Scientific Equipment for the Value Addition and Competitiveness of Local Products Through the Establishment of a Marine-Based Product Processing Support Services Laboratory)",
                endUser: "Extension Services",
                procurementMode: "NP-53.9 - Small Value Procurement",
                advertisementDate: new Date("2022-12-01"),
                submissionDate: new Date("2022-12-15"),
                awardDate: new Date("2022-12-22"),
                signingDate: new Date("2022-12-29"),
                fundSource: "Gop",
                totalBudget: 94200.00,
                mooe: 3400.00,
                co: 0,
                remarks: "1 unit Pulverizer",
                category: "MACHINERIES",
                subCategory: "EQUIPMENT OUTLAY"
            }
            ]
        },
        {
            name: "MACHINERIES/OFFICE EQUIPMENT/FURNITURES",
            code: "MOF",
            fund: "IGF-Use of Income",
            items: [
            {
                id: "2025-01-01DEF",
                code: "",
                program: "Office Equipment - Aircon Unit for 3rd Floor, convention Center",
                endUser: "Office of the Univ. President",
                procurementMode: "Shopping",
                advertisementDate: new Date("2022-12-01"),
                submissionDate: new Date("2022-12-15"),
                awardDate: new Date("2022-12-22"),
                signingDate: new Date("2022-12-29"),
                fundSource: "Income",
                totalBudget: 280000.00,
                mooe: 20000.00,
                co: 0,
                remarks: "Aircon Unit, Floor standing, Inverter 2.5tons w/ digital display",
                category: "MACHINERIES",
                subCategory: "OFFICE EQUIPMENT"
            }
            ]
        },
        // {
        //     name: "FURNITURES",
        //     code: "MOF",
        //     fund: "IGF-Use of Income",
        //     items: [
        //     {
        //         id: "2025-01-01HIJ",
        //         code: "",
        //         program: "Office Equipment - Aircon Unit for 3rd Floor, convention Center",
        //         endUser: "Office of the Univ. President",
        //         procurementMode: "Shopping",
        //         advertisementDate: new Date("2022-12-01"),
        //         submissionDate: new Date("2022-12-15"),
        //         awardDate: new Date("2022-12-22"),
        //         signingDate: new Date("2022-12-29"),
        //         fundSource: "Income",
        //         totalBudget: 280000.00,
        //         mooe: 0,
        //         co: 80000.00,
        //         remarks: "Aircon Unit, Floor standing, Inverter 2.5tons w/ digital display",
        //         category: "MACHINERIES",
        //         subCategory: "OFFICE EQUIPMENT"
        //     }
        //     ]
        // },
        // {
        //     name: "SERVICES",
        //     code: "MOF",
        //     fund: "IGF-Use of Income",
        //     items: [
        //     {
        //         id: "2025-01-01KLM",
        //         code: "",
        //         program: "Office Equipment - Aircon Unit for 3rd Floor, convention Center",
        //         endUser: "Office of the Univ. President",
        //         procurementMode: "Shopping",
        //         advertisementDate: new Date("2022-12-01"),
        //         submissionDate: new Date("2022-12-15"),
        //         awardDate: new Date("2022-12-22"),
        //         signingDate: new Date("2022-12-29"),
        //         fundSource: "Income",
        //         totalBudget: 120000.00,
        //         mooe: 0,
        //         co: 40000.00,
        //         remarks: "Aircon Unit, Floor standing, Inverter 2.5tons w/ digital display",
        //         category: "MACHINERIES",
        //         subCategory: "OFFICE EQUIPMENT"
        //     }
        //     ]
        // },
        // {
        //     name: "SOFTWARE DEVELOPMENT",
        //     code: "MOF",
        //     fund: "IGF-Use of Income",
        //     items: [
        //     {
        //         id: "2025-01-0NOP",
        //         code: "",
        //         program: "Office Equipment - Aircon Unit for 3rd Floor, convention Center",
        //         endUser: "Office of the Univ. President",
        //         procurementMode: "Shopping",
        //         advertisementDate: new Date("2022-12-01"),
        //         submissionDate: new Date("2022-12-15"),
        //         awardDate: new Date("2022-12-22"),
        //         signingDate: new Date("2022-12-29"),
        //         fundSource: "Income",
        //         totalBudget: 300000.00,
        //         mooe: 0,
        //         co: 123000.00,
        //         remarks: "Aircon Unit, Floor standing, Inverter 2.5tons w/ digital display",
        //         category: "MACHINERIES",
        //         subCategory: "OFFICE EQUIPMENT"
        //     }
        //     ]
        // }
        ]
    };