"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Column } from "drizzle-orm";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Advocate = {
  city: string;
  degree: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  specialties: string[];
  yearsOfExperience: number;
};

const ColumnHeader = ({ header }: { header: string }) => {
  return <div className="whitespace-nowrap">{header}</div>;
};

export const columns: ColumnDef<Advocate>[] = [
  {
    accessorKey: "firstName",
    header: () => <ColumnHeader header="First Name" />,
  },
  {
    accessorKey: "lastName",
    header: () => <ColumnHeader header="Last Name" />,
  },
  {
    accessorKey: "city",
    header: () => <ColumnHeader header="City" />,
  },
  {
    accessorKey: "degree",
    header: () => <ColumnHeader header="Degree" />,
  },
  {
    accessorKey: "specialties",
    header: () => <ColumnHeader header="Specialties" />,
    cell: ({ row }) => {
      const value = row.getValue("specialties") as string[];

      return (
        <ul className="list-disc pl-5">
          {value.map((specialty, index) => {
            const key = `${specialty}-${index}`;
            return <li key={key}>{specialty}</li>;
          })}
        </ul>
      );
    },
  },
  {
    accessorKey: "yearsOfExperience",
    header: () => <ColumnHeader header="Years of Experience" />,
  },
  {
    accessorKey: "phoneNumber",
    header: () => <ColumnHeader header="Phone Number" />,
  },
];
