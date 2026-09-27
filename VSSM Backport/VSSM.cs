using System.Reflection;
using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Models.Spt.Mod;
using Range = SemanticVersioning.Range;

namespace VSSM;

public record ModMetadata : IModMetadata
{
	public string ModGuid { get; init; } = "com.lyconox.vssm";
	public string Name { get; init; } = "VSSM";
	public string Author { get; init; } = "Lyconox";
	public List<string>? Contributors { get; init; } = ["Sanote", "Pettan", "Chomp", "Shirito"];
	public SemanticVersioning.Version Version { get; init; } = new("1.0.1");
	public Range SptVersion { get; init; } = new("~4.1.5");
	public bool HasPrepatcher { get; init; }
	public List<string>? Incompatibilities { get; init; }
	public Dictionary<string, Range>? ModDependencies { get; init; } = new()
	{
		{ "com.wtt.commonlib", new Range("~3.0.0") }
	};
	public string? Url { get; init; }
	public string License { get; init; } = "CC BY-NC-ND 4.0";
}

[Injectable(TypePriority = OnLoadOrder.GameCallbacks + 1)]
public class VSSM(WTTServerCommonLib.WTTServerCommonLib wttCommon) : IOnLoad
{
	public async Task OnLoadAsync(CancellationToken cancellationToken)
	{
		await wttCommon.CustomItemServiceExtended.CreateCustomItems(Assembly.GetExecutingAssembly());
	}
}
