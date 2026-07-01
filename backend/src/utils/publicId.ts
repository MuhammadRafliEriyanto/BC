type PublicIdQuery = {
  sort: (sort: Record<string, 1 | -1>) => {
    select: (field: string) => {
      lean: () => Promise<Record<string, unknown> | null>;
    };
  };
};

type PublicIdModel = {
  findOne: (filter: Record<string, RegExp>) => PublicIdQuery;
};

export async function getNextPublicId(
  model: PublicIdModel,
  field: string,
  prefix: string,
): Promise<string> {
  const aggregationModel = model as unknown as {
    aggregate: (pipeline: Array<Record<string, unknown>>) => {
      exec: () => Promise<Array<{ numericValue?: number }>>;
    };
  };
  const [latestDocument] = await aggregationModel
    .aggregate([
      {
        $match: {
          [field]: new RegExp(`^${prefix}-\\d+$`),
        },
      },
      {
        $project: {
          numericValue: {
            $convert: {
              input: {
                $arrayElemAt: [{ $split: [`$${field}`, "-"] }, -1],
              },
              to: "int",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      { $sort: { numericValue: -1 } },
      { $limit: 1 },
    ])
    .exec();

  const latestNumber = latestDocument?.numericValue ?? 0;
  const nextNumber = latestNumber + 1;

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}
