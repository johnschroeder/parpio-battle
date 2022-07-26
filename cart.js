function travel_time(cp) {
  return 240 + 5 * cp;
}

function fertility_cost(count) {
  let costs = [0, 1, 3, 9, 16];
  let total = 0;
  for(let i = 0; i <= count; i++) {
    total += costs[i];
  }
  return total;
}

function deposit_cost(count) {
  switch (count) {
    case 0:
      return 0;
    case 1:
      // just random
      return 1;
    case 2:
      // 1 deposit, 1 bonus, clay
      return 3;
    default:
      return (count-2) * (count - 1) / 2 + 3;
  }
}

function total_cost(fert_count, dep_count) {
  return fertility_cost(fert_count) + deposit_cost(dep_count);
}

function gold_gain(fert_count, dep_count) {
  return 50 * fert_count + 25 * dep_count;
}

function gold_per_minute(fert_count, dep_count) {
  let gold = gold_gain(fert_count, dep_count);
  let time = travel_time(total_cost(fert_count, dep_count));
  return gold / time;
}

let max_dep_to_try = 30;

function best_config(cart_points) {
  let best_fert = 0, best_dep = 0, best_gpm = 0;
  for (let dep = 0; dep < max_dep_to_try; dep++) {
    let dc = deposit_cost(dep);
    if (dc > cart_points) {
      break;
    }
    for (let fert = 0; fert <= 4; fert++) {
      let fc = fertility_cost(fert)
      if (fc + dc > cart_points) {
        continue;
      }
      let gpm = gold_per_minute(fert, dep);
      if (gpm > best_gpm) {
        best_fert = fert;
        best_dep = dep;
        best_gpm = gpm;
      }
    }
  }
  return [best_fert, best_dep, best_gpm];
}

function plural(n, s) {
  return (n === 1) ? s : s + "s";
}

function go(e) {
  let [fert, dep, gpm] = best_config(e.currentTarget.value);
  let gph = (gpm * 60).toFixed(2);
  let deposit_text = '';
  switch (dep) {
    case 0:
      deposit_text = '0 deposits';
      break;
    case 1:
      deposit_text = '1 deposit';
      break;
    default:
      deposit_text = `1 deposit, ${dep-1} bonus ${plural(dep-1, 'deposit')} (clay checked)`;
  }
  document.getElementById('result').innerText = `Best Coins/Hr: ${gph} using ${fert} fertilities and ${deposit_text}`;
}

window.onload = () => {
  document.getElementById('cart_points').addEventListener('input', go);
}
